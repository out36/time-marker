use std::fs;
use tauri::Manager;
use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct TimeBlock {
    id: String,
    startTime: String, // mapped to start_time
    endTime: String,   // mapped to end_time
    themeId: String,   // mapped to theme_id
    notes: String,
    date: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Theme {
    id: String,
    name: String,
    color: String,
    description: Option<String>,
}

// Database initialization
fn init_db(app_handle: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let app_dir = app_handle.path().app_data_dir()?;
    if !app_dir.exists() {
        fs::create_dir_all(&app_dir)?;
    }
    let db_path = app_dir.join("time_marker.db");
    
    let conn = Connection::open(db_path)?;
    
    conn.execute(
        "CREATE TABLE IF NOT EXISTS time_blocks (
            id TEXT PRIMARY KEY,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            theme_id TEXT NOT NULL,
            notes TEXT DEFAULT '',
            date TEXT NOT NULL
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS themes (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            color TEXT NOT NULL,
            description TEXT
        )",
        [],
    )?;

    // Check if themes table is empty, if so, insert defaults
    let mut stmt = conn.prepare("SELECT count(*) FROM themes")?;
    let count: i32 = stmt.query_row([], |row| row.get(0))?;

    if count == 0 {
        let defaults = vec![
            ("work", "Work", "#3B82F6", "Work related activities"),
            ("study", "Study", "#10B981", "Learning and reading"),
            ("rest", "Rest", "#F59E0B", "Rest and relaxation"),
            ("exercise", "Exercise", "#EF4444", "Sports and fitness"),
            ("social", "Social", "#8B5CF6", "Social activities"),
            ("hobby", "Hobby", "#06B6D4", "Personal hobbies"),
            ("meal", "Meal", "#F97316", "Dining time"),
            ("other", "Other", "#6B7280", "Other activities"),
        ];

        for (id, name, color, desc) in defaults {
            conn.execute(
                "INSERT INTO themes (id, name, color, description) VALUES (?1, ?2, ?3, ?4)",
                params![id, name, color, desc],
            )?;
        }
    }
    
    Ok(())
}

#[tauri::command]
fn save_time_block(app_handle: tauri::AppHandle, block: TimeBlock) -> Result<(), String> {
    let app_dir = app_handle.path().app_data_dir().map_err(|e| e.to_string())?;
    let db_path = app_dir.join("time_marker.db");
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT OR REPLACE INTO time_blocks (id, start_time, end_time, theme_id, notes, date)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![
            block.id,
            block.startTime,
            block.endTime,
            block.themeId,
            block.notes,
            block.date
        ],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn get_time_blocks(app_handle: tauri::AppHandle, date: String) -> Result<Vec<TimeBlock>, String> {
    let app_dir = app_handle.path().app_data_dir().map_err(|e| e.to_string())?;
    let db_path = app_dir.join("time_marker.db");
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;

    let mut stmt = conn.prepare(
        "SELECT id, start_time, end_time, theme_id, notes, date FROM time_blocks WHERE date = ?1"
    ).map_err(|e| e.to_string())?;

    let block_iter = stmt.query_map(params![date], |row| {
        Ok(TimeBlock {
            id: row.get(0)?,
            startTime: row.get(1)?,
            endTime: row.get(2)?,
            themeId: row.get(3)?,
            notes: row.get(4)?,
            date: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut blocks = Vec::new();
    for block in block_iter {
        blocks.push(block.map_err(|e| e.to_string())?);
    }

    Ok(blocks)
}

#[tauri::command]
fn delete_time_block(app_handle: tauri::AppHandle, id: String) -> Result<(), String> {
    let app_dir = app_handle.path().app_data_dir().map_err(|e| e.to_string())?;
    let db_path = app_dir.join("time_marker.db");
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;

    conn.execute(
        "DELETE FROM time_blocks WHERE id = ?1",
        params![id],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn get_themes(app_handle: tauri::AppHandle) -> Result<Vec<Theme>, String> {
    let app_dir = app_handle.path().app_data_dir().map_err(|e| e.to_string())?;
    let db_path = app_dir.join("time_marker.db");
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;

    let mut stmt = conn.prepare(
        "SELECT id, name, color, description FROM themes"
    ).map_err(|e| e.to_string())?;

    let theme_iter = stmt.query_map([], |row| {
        Ok(Theme {
            id: row.get(0)?,
            name: row.get(1)?,
            color: row.get(2)?,
            description: row.get(3)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut themes = Vec::new();
    for theme in theme_iter {
        themes.push(theme.map_err(|e| e.to_string())?);
    }

    Ok(themes)
}

#[tauri::command]
fn save_theme(app_handle: tauri::AppHandle, theme: Theme) -> Result<(), String> {
    let app_dir = app_handle.path().app_data_dir().map_err(|e| e.to_string())?;
    let db_path = app_dir.join("time_marker.db");
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT OR REPLACE INTO themes (id, name, color, description)
         VALUES (?1, ?2, ?3, ?4)",
        params![
            theme.id,
            theme.name,
            theme.color,
            theme.description
        ],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn delete_theme(app_handle: tauri::AppHandle, id: String) -> Result<(), String> {
    let app_dir = app_handle.path().app_data_dir().map_err(|e| e.to_string())?;
    let db_path = app_dir.join("time_marker.db");
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;

    conn.execute(
        "DELETE FROM themes WHERE id = ?1",
        params![id],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      // Initialize DB
      if let Err(e) = init_db(app.handle()) {
        eprintln!("Error initializing database: {}", e);
      }

      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
        save_time_block,
        get_time_blocks,
        delete_time_block,
        get_themes,
        save_theme,
        delete_theme
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
