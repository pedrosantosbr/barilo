import OpenAI from "openai";

const openai = new OpenAI();

const CORS_HEADERS = {
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS, POST", // Adjust methods as needed
    "Access-Control-Allow-Headers": "Content-Type", // Adjust headers as needed
  },
};

type WSData = {
  id: string;
  createdAt: Date;
};

type WsMessage =
  | {
      type: "subscribe";
      channel: string;
    }
  | {
      type: "unsubscribe";
      channel: string;
    }
  | {
      type: "publish";
      channel: string;
      message: string;
    };

const server = Bun.serve<WSData>({
  fetch(req, server) {
    const clientId = crypto.randomUUID();
    const success = server.upgrade(req, {
      data: {
        id: clientId,
        createdAt: Date(),
      },
    });

    return success
      ? new Response("success", CORS_HEADERS)
      : new Response("WebSocket upgrade error", {
          ...CORS_HEADERS,
          status: 500,
        });
  },
  websocket: {
    open(ws) {
      console.debug(`Client connected: ${ws.data.id}`);
      ws.subscribe("chat");
    },
    async message(ws, message) {
      // we could use zod here
      const payload = JSON.parse(message as string) as WsMessage;

      switch (payload.type) {
        case "subscribe":
          ws.subscribe(payload.channel);
          break;

        case "unsubscribe":
          ws.unsubscribe(payload.channel);
          break;

        case "publish":
          const stream = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "user",
                content:
                  "Liste 3 receitas de macarrão juntamente com o modo de preparo. Seja bem específico quanto aos ingredientes e o modo de preparo.",
              },
            ],
            stream: true,
          });

          for await (const chunk of stream) {
            const recipe = chunk.choices[0]?.delta?.content || "";
            server.publish(payload.channel, Buffer.from(recipe, "utf-8"));
          }

          break;

        default:
          console.log("Unkonwn event");
      }
    },
    close(ws) {
      const msg = `${ws.data.id} has left the chat`;
      console.log(msg);
    },
  },
});

console.log(`Listening on ${server.hostname}:${server.port}`);
