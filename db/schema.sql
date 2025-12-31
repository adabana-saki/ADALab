-- Tetris Leaderboard Schema
-- Run: npx wrangler d1 execute adalab_db --file=./db/schema.sql

CREATE TABLE IF NOT EXISTS tetris_leaderboard (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nickname TEXT NOT NULL,
  score INTEGER NOT NULL,
  lines INTEGER NOT NULL,
  level INTEGER NOT NULL,
  date TEXT NOT NULL,
  mode TEXT NOT NULL CHECK(mode IN ('endless', 'sprint', 'timeAttack')),
  time INTEGER,
  device_id TEXT,
  user_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster score lookups
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON tetris_leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_mode_score ON tetris_leaderboard(mode, score DESC);
-- Index for device_id + mode (1 user = 1 record system)
CREATE INDEX IF NOT EXISTS idx_leaderboard_device_mode ON tetris_leaderboard(device_id, mode);
-- Index for user_id + mode
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_mode ON tetris_leaderboard(user_id, mode);

-- 2048 Leaderboard Schema
CREATE TABLE IF NOT EXISTS game_2048_leaderboard (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nickname TEXT NOT NULL,
  score INTEGER NOT NULL,
  max_tile INTEGER NOT NULL,
  moves INTEGER NOT NULL,
  date TEXT NOT NULL,
  device_id TEXT,
  user_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for 2048 leaderboard
CREATE INDEX IF NOT EXISTS idx_2048_leaderboard_score ON game_2048_leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS idx_2048_leaderboard_device ON game_2048_leaderboard(device_id);
CREATE INDEX IF NOT EXISTS idx_2048_leaderboard_user ON game_2048_leaderboard(user_id);

-- Users Table (for Firebase auth sync)
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
