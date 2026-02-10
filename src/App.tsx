import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { ask } from "@tauri-apps/plugin-dialog";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [fileError, setFileError] = useState("");
  const [dialogResult, setDialogResult] = useState<boolean | null>(null);

  async function greet() {
    try {
      const msg = await invoke<string>("greet", { name });
      setGreetMsg(msg);
    } catch (err) {
      setGreetMsg(`Error: ${err}`);
    }
  }

  async function listFiles() {
    setFileError("");
    setFiles([]);

    if (!path.trim()) {
      setFileError("Please enter a path.");
      return;
    }

    try {
      const result = await invoke<string[]>("list_files", { path });
      setFiles(result);
    } catch (err) {
      setFileError(String(err));
    }
  }

  async function openDialog() {
    const confirmed = await ask(
      "This action cannot be reverted. Are you sure?",
      { title: "Warning", kind: "warning" }
    );
    setDialogResult(confirmed);
  }

  return (
    <main className="container">
      <h1>Welcome to Tauri + React</h1>

      <div className="row">
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank" rel="noreferrer">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://reactjs.org" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      {/* Greet form */}
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

      {/* File listing form — submit on Enter / button click, not every keystroke */}
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          listFiles();
        }}
      >
        <input
          id="path-input"
          value={path}
          onChange={(e) => setPath(e.currentTarget.value)}
          placeholder="Enter a path..."
        />
        <button type="submit">List Files</button>
      </form>

      {fileError && <p style={{ color: "red" }}>{fileError}</p>}

      <ul>
        {files.map((file) => (
          <li key={file}>{file}</li>
        ))}
      </ul>

      {/* Dialog demo */}
      <div>
        <button onClick={openDialog}>Open Dialog</button>
        {dialogResult !== null && (
          <p>User chose: <strong>{dialogResult ? "Yes" : "No"}</strong></p>
        )}
      </div>
    </main>
  );
}

export default App;