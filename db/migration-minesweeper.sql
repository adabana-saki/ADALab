-- Migration: Minesweeper Leaderboard
-- Run: npx wrangler d1 execute adalab_db --remote --file=./db/migration-minesweeper.sql

CREATE TABLE IF NOT EXISTS minesweeper_leaderboard (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nickname TEXT NOT NULL,
  time_seconds REAL NOT NULL,
  difficulty TEXT NOT NULL CHECK(difficulty IN ('beginner', 'intermediate', 'expert')),
  date TEXT NOT NULL,
  device_id TEXT,
  user_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster time lookups (ascending - lower is better)
CREATE INDEX IF NOT EXISTS idx_minesweeper_time ON minesweeper_leaderboard(time_seconds ASC);
CREATE INDEX IF NOT EXISTS idx_minesweeper_difficulty_time ON minesweeper_leaderboard(difficulty, time_seconds ASC);
CREATE INDEX IF NOT EXISTS idx_minesweeper_device ON minesweeper_leaderboard(device_id);
CREATE INDEX IF NOT EXISTS idx_minesweeper_user ON minesweeper_leaderboard(user_id);
CREATE INDEX IF NOT EXISTS idx_minesweeper_user_difficulty ON minesweeper_leaderboard(user_id, difficulty);
