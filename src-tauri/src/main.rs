
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::command;
use serde_json::{json, Value};

// --- Authentication Commands ---
#[command]
fn login_user(username: String, pin: String) -> Result<Value, String> {
    // محاكاة الربط مع SQLite عبر Rust
    if username == "admin" && pin == "1234" {
        Ok(json!({
            "id": "owner-id",
            "username": "admin",
            "displayName": "المدير العام",
            "role": "owner",
            "permissions": ["*"]
        }))
    } else {
        Err("Username or PIN is incorrect".into())
    }
}

#[command]
fn get_users() -> Result<Value, String> {
    Ok(json!([]))
}

#[command]
fn create_user(user: Value) -> Result<Value, String> {
    Ok(json!({ "success": true }))
}

// --- Inventory Commands ---
#[command]
fn get_products() -> Result<Value, String> {
    Ok(json!([]))
}

#[command]
fn save_product(product: Value) -> Result<Value, String> {
    println!("Saving to SQLite: {:?}", product);
    Ok(json!({ "success": true }))
}

#[command]
fn delete_product(id: String) -> Result<Value, String> {
    Ok(json!({ "success": true }))
}

#[command]
fn get_categories() -> Result<Value, String> {
    Ok(json!([]))
}

#[command]
fn save_category(name: String, image: Option<String>) -> Result<Value, String> {
    Ok(json!({ "success": true }))
}

// --- Sales & POS Commands ---
#[command]
fn process_sale(cart: Value, customer: Value, payment: Value) -> Result<Value, String> {
    let invoice_no = format!("INV-{}", chrono::Local::now().format("%y%m%d%H%M"));
    Ok(json!({ "success": true, "invoiceNo": invoice_no }))
}

// --- System Commands ---
#[command]
fn log_audit(action: String, details: String, user: String) -> Result<(), String> {
    println!("[AUDIT] User: {}, Action: {}, Details: {}", user, action, details);
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            login_user,
            get_users,
            create_user,
            get_products,
            save_product,
            delete_product,
            get_categories,
            save_category,
            process_sale,
            log_audit
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
