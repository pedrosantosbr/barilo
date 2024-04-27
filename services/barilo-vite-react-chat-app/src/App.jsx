import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { getBytes, getLines, getMessages } from "./fetch";

const LastEventId = "last-event-id";

function App() {
  const [message, setMessage] = useState("");

  const renderStreamResponse = (newMessage) => {
    // console.log(newMessage);
    setMessage((prevMessage) => prevMessage + newMessage);
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
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={fetchRecipes}>Submit</button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">{message}</p>
    </>
  );
}

export default App;
