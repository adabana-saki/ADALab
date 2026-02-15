-- Migration: Add minesweeper to user_game_stats and user_achievements CHECK constraints
-- Run: npx wrangler d1 execute adalab_db --remote --file=./db/migration-minesweeper-dashboard.sql

-- SQLite doesn't support ALTER CHECK constraint, so we recreate the tables

-- Step 1: Recreate user_game_stats with minesweeper support
CREATE TABLE IF NOT EXISTS user_game_stats_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  game_type TEXT NOT NULL CHECK(game_type IN ('tetris', '2048', 'snake', 'typing', 'minesweeper')),
  stats_json TEXT NOT NULL DEFAULT '{}',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, game_type)
);

INSERT INTO user_game_stats_new (id, user_id, game_type, stats_json, updated_at)
  SELECT id, user_id, game_type, stats_json, updated_at FROM user_game_stats;

DROP TABLE user_game_stats;
ALTER TABLE user_game_stats_new RENAME TO user_game_stats;

CREATE INDEX IF NOT EXISTS idx_user_game_stats_user ON user_game_stats(user_id);

-- Step 2: Recreate user_achievements with minesweeper support
CREATE TABLE IF NOT EXISTS user_achievements_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  game_type TEXT NOT NULL CHECK(game_type IN ('tetris', '2048', 'snake', 'typing', 'minesweeper')),
  achievement_id TEXT NOT NULL,
  unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, game_type, achievement_id)
);

INSERT INTO user_achievements_new (id, user_id, game_type, achievement_id, unlocked_at)
  SELECT id, user_id, game_type, achievement_id, unlocked_at FROM user_achievements;

DROP TABLE user_achievements;
ALTER TABLE user_achievements_new RENAME TO user_achievements;

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
