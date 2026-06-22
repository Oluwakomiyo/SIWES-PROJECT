const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

async function setupDatabase() {
    const db = await open({
        filename: './database.db',
        driver: sqlite3.Database
    });

    // 1. Core Table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            description TEXT,
            category TEXT,
            location TEXT,
            client_name TEXT,
            completion_date DATE,
            is_featured INTEGER DEFAULT 0,
            project_manager TEXT,
            project_value TEXT,
            partner TEXT
        )
    `);

    // Inside server/database.js -> setupDatabase()
    await db.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action_type TEXT NOT NULL, -- 'PROJECT_CREATE', 'PROJECT_DELETE', 'IMAGE_ADD', 'IMAGE_DELETE'
        project_name TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
   `);

    // 2. FORCE MIGRATION (In case the table existed before)
    // We try to add each column one by one. If they exist, it skips.
    const columns = ['project_manager', 'project_value', 'partner', 'client_name'];
    for (let col of columns) {
        try {
            await db.exec(`ALTER TABLE projects ADD COLUMN ${col} TEXT`);
            console.log(`Added column: ${col}`);
        } catch (e) {
            // Column already exists, do nothing
        }
    }

    // ... rest of setup ...
    return db;
}

module.exports = setupDatabase;