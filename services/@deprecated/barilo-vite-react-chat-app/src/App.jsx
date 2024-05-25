import { useState } from "react";
import { getBytes, getLines, getMessages } from "./fetch";
import { Button } from "./components/ui/button";

const LastEventId = "last-event-id";

function App() {
  const [message, setMessage] = useState("");

  const renderStreamResponse = (newMessage) => {
    console.log(`🔭 rendering stream response`);
    let { data } = newMessage;
    if (data === "[DONE]") {
      return;
    }
    console.log(`🔭 data`, data);

    const chunks = data.split("\n");
    chunks.map((chunk) => {
      if (chunk) {
        const conversation = JSON.parse(chunk);
        conversation.choices.map((choice) => {
          /**
           * @type {string}
           */
          let message = choice.delta.content;

          const formatMessage = () => {
            console.log(`🔭 formatting message`, message);
            if (message !== null && message !== undefined && message !== "") {
              return message.replace(/\n/g, "<br>");
            }
            return message;
          };
          setMessage((prevMessage) => prevMessage + formatMessage(message));
        });
      }
    });
  };

  const fetchRecipes = async () => {
    /**
     * @type {Record<string, string>}
     */
    const headers = {};

    try {
      const response = await fetch(
        "http://localhost:9234/api/v1/recipes/suggestions",
        {
          method: "POST",
          headers: {
            Accept: "text/event-stream",
          },
        }
      );

      // -

      await (async function () {
        if (response.ok && response.status == 200) {
          console.log("Connection made", response);
        } else if (
          response.status >= 400 &&
          response.status < 500 &&
          response.status !== 429
        ) {
          console.log("Client side error", response);
        }
      })();

      // -

      await getBytes(
        response.body,
        getLines(
          getMessages(
            (id) => {
              if (id) {
                // store the id and send it back on the next retry:
                headers[LastEventId] = id;
              } else {
                // don't send the last-event-id header anymore:
                delete headers[LastEventId];
              }
            },
            (retry) => {
              console.log(":: retry:", retry);
            },
            renderStreamResponse
          )
        )
      );
    } catch (error) {
      console.log(":: error:", error);
    }
  };

  return (
    <div className="container p-20">
      <h1>Barilo</h1>
      <p
        className="read-the-docs text-left"
        dangerouslySetInnerHTML={{ __html: message }}
      ></p>
      <div className="card">
        <Button onClick={fetchRecipes}>Get recipes</Button>
      </div>
    </div>
  );
}

export default App;
