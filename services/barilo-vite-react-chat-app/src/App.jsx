import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const newEventSource = () => {
    const es = new EventSource("http://localhost:9234/api/recipes/suggestions");
    es.onopen = () => console.log(">>> Connection opened!");
    es.onerror = (e) => {
      // log error
      console.log("ERROR!", e);
      es.close(); // Close the connection on error
    };
    es.onmessage = (e) => {
      console.log(e);
      if (e.data === "[DONE]") {
        console.log("Closing connection");
        es.close();
      }
    };
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
        <button onClick={newEventSource}>Submit</button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
