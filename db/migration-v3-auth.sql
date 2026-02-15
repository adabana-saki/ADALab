-- Migration v3: Add user authentication and game tables
-- Run: npx wrangler d1 execute adalab_db --file=./db/migration-v3-auth.sql

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT,
  nickname TEXT NOT NULL,
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);

-- User game stats (stores JSON data per game)
CREATE TABLE IF NOT EXISTS user_game_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  game_type TEXT NOT NULL CHECK(game_type IN ('tetris', '2048', 'snake', 'typing')),
  stats_json TEXT NOT NULL DEFAULT '{}',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, game_type)
);

CREATE INDEX IF NOT EXISTS idx_user_game_stats_user ON user_game_stats(user_id);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  game_type TEXT NOT NULL CHECK(game_type IN ('tetris', '2048', 'snake', 'typing')),
  achievement_id TEXT NOT NULL,
  unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, game_type, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);

-- Snake Leaderboard
CREATE TABLE IF NOT EXISTS snake_leaderboard (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nickname TEXT NOT NULL,
  score INTEGER NOT NULL,
  length INTEGER NOT NULL,
  time_survived INTEGER,
  date TEXT NOT NULL,
  device_id TEXT,
  user_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_snake_leaderboard_score ON snake_leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS idx_snake_leaderboard_device ON snake_leaderboard(device_id);
CREATE INDEX IF NOT EXISTS idx_snake_leaderboard_user ON snake_leaderboard(user_id);

-- Typing Leaderboard
CREATE TABLE IF NOT EXISTS typing_leaderboard (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nickname TEXT NOT NULL,
  wpm INTEGER NOT NULL,
  accuracy REAL NOT NULL,
  mode TEXT NOT NULL CHECK(mode IN ('time', 'sudden_death', 'word_count')),
  language TEXT NOT NULL CHECK(language IN ('en', 'ja', 'mixed')),
  words_typed INTEGER NOT NULL,
  time_seconds INTEGER,
  date TEXT NOT NULL,
  device_id TEXT,
  user_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_typing_leaderboard_wpm ON typing_leaderboard(wpm DESC);
CREATE INDEX IF NOT EXISTS idx_typing_leaderboard_mode ON typing_leaderboard(mode, wpm DESC);
CREATE INDEX IF NOT EXISTS idx_typing_leaderboard_device ON typing_leaderboard(device_id);
CREATE INDEX IF NOT EXISTS idx_typing_leaderboard_user ON typing_leaderboard(user_id);

-- Add user_id column to existing leaderboards
ALTER TABLE tetris_leaderboard ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE game_2048_leaderboard ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Create indexes for user_id on existing tables
CREATE INDEX IF NOT EXISTS idx_tetris_leaderboard_user ON tetris_leaderboard(user_id);
CREATE INDEX IF NOT EXISTS idx_2048_leaderboard_user ON game_2048_leaderboard(user_id);
