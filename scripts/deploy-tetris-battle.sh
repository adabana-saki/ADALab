#!/bin/bash
# Tetris Battle デプロイスクリプト
# 使い方: ./scripts/deploy-tetris-battle.sh

set -e

echo "=== Tetris Battle デプロイ ==="

# 1. D1マイグレーション
echo ""
echo "[1/3] D1マイグレーション実行中..."
npx wrangler d1 execute adalab_db --file=./db/migration-v2-device-id.sql --remote

# 2. Worker依存関係インストール
echo ""
echo "[2/3] Worker依存関係インストール中..."
cd workers/tetris-battle
npm install

# 3. Workerデプロイ
echo ""
echo "[3/3] Workerデプロイ中..."
npx wrangler deploy

echo ""
echo "=== デプロイ完了 ==="
echo ""
echo "次のステップ:"
echo "1. 上に表示されたWorker URLをコピー"
echo "2. Cloudflare Pages > Settings > Environment variables に追加:"
echo "   NEXT_PUBLIC_BATTLE_WORKER_URL=<Worker URL>"
echo "3. git push でメインサイトをデプロイ"
