-- Migration: Create users table
-- Run: npx wrangler d1 execute adalab_db --file=./db/migration_add_user_id.sql --remote
--
-- Note: Run each statement separately if errors occur

-- Create users table if not exists
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT,
  display_name TEXT,
  photo_url TEXT,
  nickname TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for users
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
