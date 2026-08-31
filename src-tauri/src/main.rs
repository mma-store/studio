
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::command;

#[command]
fn login_user(username: String, pin: String) -> Result<serde_json::Value, String> {
    // Placeholder for real SQLite logic in Rust
    if username == "admin" && pin == "1234" {
        Ok(serde_json::json!({
            "id": "1",
            "username": "admin",
            "displayName": "المدير العام",
            "role": "owner",
            "permissions": ["*"]
        }))
    } else {
        Err("Invalid credentials".into())
    }
}

#[command]
fn get_products() -> Vec<serde_json::Value> {
    // Rust-managed SQLite call
    vec![]
}

#[command]
fn save_product(product: serde_json::Value) -> Result<(), String> {
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            login_user,
            get_products,
            save_product
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
