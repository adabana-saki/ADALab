@echo off
REM Tetris Battle デプロイスクリプト (Windows)
REM 使い方: scripts\deploy-tetris-battle.bat

echo === Tetris Battle デプロイ ===
echo.

echo [1/3] D1マイグレーション実行中...
call npx wrangler d1 execute adalab_db --file=./db/migration-v2-device-id.sql --remote
if errorlevel 1 goto :error

echo.
echo [2/3] Worker依存関係インストール中...
cd workers\tetris-battle
call npm install
if errorlevel 1 goto :error

echo.
echo [3/3] Workerデプロイ中...
call npx wrangler deploy
if errorlevel 1 goto :error

cd ..\..

echo.
echo === デプロイ完了 ===
echo.
echo 次のステップ:
echo 1. 上に表示されたWorker URLをコピー
echo 2. Cloudflare Pages の Settings で Environment variables に追加:
echo    NEXT_PUBLIC_BATTLE_WORKER_URL=(Worker URL)
echo 3. git push でメインサイトをデプロイ
goto :end

:error
echo.
echo エラーが発生しました
cd ..\..

:end
pause
