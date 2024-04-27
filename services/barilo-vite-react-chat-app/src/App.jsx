import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");

  const renderStreamResponse = (newMessage) => {
    setMessage((prevMessage) => prevMessage + newMessage);
  };

  const fetchRecipes = async () => {
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

      const reader = response.body.getReader();
      let result = new Uint8Array();
      while (!(result = await reader.read()).done) {
        const text = new TextDecoder("utf-8").decode(result.value);
        renderStreamResponse(text);
      }
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
