import OpenAI from "openai/index.mjs";
import { defaultSystemPrompt, defaultUserPrompt } from "./prompt";
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CORS_HEADERS = {
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS, POST",
    "Access-Control-Allow-Headers": "Content-Type",
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
  port: 1500,
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
      ws.subscribe("chat");
    },
    async message(ws, message) {
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
            model: "gpt-4-turbo",
            messages: [
              {
                role: "assistant",
                content: defaultSystemPrompt,
              },
              {
                role: "user",
                content: `${defaultUserPrompt} \n ${payload.message}`,
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
      ws.unsubscribe("chat");
    },
  },
});

console.log(`Listening on ${server.hostname}:${server.port}`);
