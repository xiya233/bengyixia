import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sqlite = new Database(path.join(dataDir, "app.db"));
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

// Initialize tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    avatar TEXT,
    bio TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    status TEXT NOT NULL DEFAULT 'active',
    share_token TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Migration: add share_token column if not exists
  CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY);
  INSERT OR IGNORE INTO _migrations VALUES ('add_share_token');
`);

// Run column migrations
try {
  const migrationDone = sqlite.prepare("SELECT name FROM _migrations WHERE name = 'add_share_token'").get();
  if (migrationDone) {
    const columns = sqlite.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
    const hasShareToken = columns.some(c => c.name === "share_token");
    if (!hasShareToken) {
      sqlite.exec("ALTER TABLE users ADD COLUMN share_token TEXT");
    }
  }
} catch { /* column already exists */ }

sqlite.exec(`

  CREATE TABLE IF NOT EXISTS jump_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    count INTEGER NOT NULL,
    duration_minutes INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_jump_records_user_date ON jump_records(user_id, date);

  CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Default settings
  INSERT OR IGNORE INTO site_settings (key, value) VALUES ('registration_enabled', 'true');
  INSERT OR IGNORE INTO site_settings (key, value) VALUES ('site_title', '蹦叽下');
  INSERT OR IGNORE INTO site_settings (key, value) VALUES ('site_description', '每日跳绳记录');
  INSERT OR IGNORE INTO site_settings (key, value) VALUES ('max_avatar_size_mb', '5');
`);
