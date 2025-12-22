-- Tetris Leaderboard Schema
-- Run: npx wrangler d1 execute adalab_db --file=./db/schema.sql

CREATE TABLE IF NOT EXISTS tetris_leaderboard (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nickname TEXT NOT NULL,
  score INTEGER NOT NULL,
  lines INTEGER NOT NULL,
  level INTEGER NOT NULL,
  date TEXT NOT NULL,
  mode TEXT NOT NULL CHECK(mode IN ('endless', 'sprint')),
  time INTEGER,
  device_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster score lookups
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON tetris_leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_mode_score ON tetris_leaderboard(mode, score DESC);
-- Index for device_id + mode (1 user = 1 record system)
CREATE INDEX IF NOT EXISTS idx_leaderboard_device_mode ON tetris_leaderboard(device_id, mode);
