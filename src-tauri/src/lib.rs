use std::fs;
use std::path::Path;

/// Greets a user by name.
///
/// # Example (from JS)
/// ```js
/// const msg = await invoke("greet", { name: "Rustacean" });
/// ```
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {name}! You've been greeted from Rust!")
}

/// Lists file and directory names inside the given `path`.
///
/// Returns a `Result` so the frontend receives a proper error message
/// instead of a silent panic if the path is invalid or unreadable.
#[tauri::command(async)]
fn list_files(path: &str) -> Result<Vec<String>, String> {
    let dir = Path::new(path);

    // Return early with a clear error when the path doesn't exist
    if !dir.exists() {
        return Err(format!("Path does not exist: {path}"));
    }

    if !dir.is_dir() {
        return Err(format!("Path is not a directory: {path}"));
    }

    fs::read_dir(dir)
        .map_err(|e| format!("Failed to read directory '{path}': {e}"))?
        .map(|entry| {
            entry
                .map_err(|e| format!("Failed to read entry: {e}"))
                .and_then(|e| {
                    e.file_name()
                        .into_string()
                        .map_err(|name| format!("Non-UTF-8 filename: {name:?}"))
                })
        })
        .collect()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, list_files])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}