
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::command;
use serde_json::{json, Value};

// أمر تسجيل الدخول المحلي من قاعدة بيانات SQLite
#[command]
fn login_user(username: String, pin: String) -> Result<Value, String> {
    // ملاحظة: هنا يتم الربط مع محرك SQLite عبر Rust في النسخة النهائية
    // للتجربة الحالية، نقوم بمحاكاة الاستجابة الناجحة للمدير الافتراضي
    if username == "admin" && pin == "1234" {
        Ok(json!({
            "id": "local-owner",
            "username": "admin",
            "displayName": "المدير العام (DUBSAR 2.0)",
            "role": "owner",
            "permissions": ["*"]
        }))
    } else {
        Err("بيانات الدخول غير صحيحة".into())
    }
}

// أمر جلب المنتجات من SQLite
#[command]
fn get_products() -> Result<Value, String> {
    // محاكاة جلب البيانات من ملف dubsar.db
    Ok(json!([]))
}

// أمر حفظ منتج في SQLite
#[command]
fn save_product(product: Value) -> Result<(), String> {
    println!("Saving product to local SQLite: {:?}", product);
    Ok(())
}

// أمر جلب الأقسام
#[command]
fn get_categories() -> Result<Value, String> {
    Ok(json!([]))
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            login_user,
            get_products,
            save_product,
            get_categories
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
