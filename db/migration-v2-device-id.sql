-- Migration v2: Add device_id column for 1 user = 1 record system
-- Run: npx wrangler d1 execute adalab_db --file=./db/migration-v2-device-id.sql --remote

-- Add device_id column (nullable for backward compatibility with existing records)
ALTER TABLE tetris_leaderboard ADD COLUMN device_id TEXT;

-- Create index for device_id + mode lookup (used in UPSERT logic)
CREATE INDEX IF NOT EXISTS idx_leaderboard_device_mode ON tetris_leaderboard(device_id, mode);
