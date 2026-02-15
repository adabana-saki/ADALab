-- Migration v4: Add user game settings table
-- Run: npx wrangler d1 execute adalab_db --file=./db/migration-v4-settings.sql --remote

-- User game settings (stores JSON settings per game)
CREATE TABLE IF NOT EXISTS user_game_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  game_type TEXT NOT NULL CHECK(game_type IN ('global', 'tetris', '2048', 'snake', 'typing')),
  settings_json TEXT NOT NULL DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, game_type)
);

CREATE INDEX IF NOT EXISTS idx_user_game_settings_user ON user_game_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_game_settings_game ON user_game_settings(user_id, game_type);
