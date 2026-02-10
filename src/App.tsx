import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { ask } from "@tauri-apps/plugin-dialog";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [listOfFiles, setListOfIles] = useState<string[]>([]);

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke<string>("greet", { name }));
  }

  return (
    <main className="container">
      <h1>Welcome to Tauri + React</h1>

      <div className="row">
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>
      <input
        id="greet-input"
        onChange={async (e) =>
          setListOfIles(
            await invoke<string[]>("list_files", { path: e.currentTarget.value }) // /sdcard/ for android
          )
        }
        placeholder="Enter a path..."
      />
      <br />
      <div>
        <button
          onClick={async () => {
            await ask("This action cannot be reverted. Are you sure?", {
              title: "Warning",
              kind: "warning",
            });
          }}
        >
          Open Dialog
        </button>
      </div>
      <ul>
        {listOfFiles?.map((file, index) => (
          <li key={index}>{file}</li>
        ))}
      </ul>
    </main>
  );
}

export default App;
