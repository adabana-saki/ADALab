# Tetris Battle Worker

Cloudflare Durable Objects を使用した Tetris オンライン対戦用 Worker。

## 概要

- **ランダムマッチング**: 待機中のプレイヤーと自動マッチング
- **プライベート部屋**: 6文字のルームコードで友達と対戦
- **リアルタイム対戦**: WebSocket を使用したリアルタイム通信
- **おじゃまブロック**: ぷよテト風の攻撃システム

## 技術スタック

- Cloudflare Workers
- Durable Objects (SQLite backend)
- WebSocket with Hibernation API

## デプロイ手順

### 1. 依存関係のインストール

```bash
cd workers/tetris-battle
npm install
```

### 2. ローカル開発

```bash
npm run dev
```

Worker は `http://localhost:8787` で起動します。

### 3. 本番デプロイ

```bash
npm run deploy
```

デプロイ後、Worker の URL を確認し、メインプロジェクトの環境変数を更新してください。

### 4. 環境変数の設定

メインプロジェクトの `.env.local` または Cloudflare Pages の環境変数に設定:

```
NEXT_PUBLIC_BATTLE_WORKER_URL=https://tetris-battle.<your-subdomain>.workers.dev
```

## API エンドポイント

### POST /api/battle/create

プライベート部屋を作成します。

```json
{
  "nickname": "Player1"
}
```

レスポンス:
```json
{
  "success": true,
  "roomId": "abc123",
  "wsUrl": "/ws/room/abc123"
}
```

### POST /api/battle/join

ルームコードで部屋に参加します。

```json
{
  "roomCode": "ABC123",
  "nickname": "Player2"
}
```

### POST /api/battle/queue

ランダムマッチングキューに参加します。

```json
{
  "nickname": "Player1",
  "playerId": "device-uuid"
}
```

### GET /api/battle/room-info?roomId=xxx

部屋の情報を取得します。

### WebSocket /ws/room/{roomId}

ゲームルームに WebSocket 接続します。

## WebSocket メッセージ

### クライアント → サーバー

- `join`: 部屋に参加
- `create_room`: 部屋を作成
- `ready` / `unready`: 準備状態の切り替え
- `field_update`: フィールド状態の同期
- `attack`: 攻撃送信
- `game_over`: ゲームオーバー通知
- `leave`: 退出
- `ping`: ヘルスチェック

### サーバー → クライアント

- `room_joined`: 部屋参加成功
- `player_joined` / `player_left`: プレイヤー入退室
- `player_ready`: 準備状態変更
- `countdown`: カウントダウン
- `game_start`: ゲーム開始
- `opponent_update`: 相手のフィールド更新
- `receive_garbage`: おじゃまブロック受信
- `opponent_attacked`: 相手の攻撃表示
- `game_end`: ゲーム終了
- `error`: エラー通知
- `pong`: ヘルスチェック応答

## 攻撃テーブル（ぷよテト準拠）

| アクション | 送信ライン |
|-----------|-----------|
| シングル | 0 |
| ダブル | 1 |
| トリプル | 2 |
| テトリス | 4 |
| Tスピンシングル | 2 |
| Tスピンダブル | 4 |
| Tスピントリプル | 6 |
| パーフェクトクリア | 10 |
| B2Bボーナス | +1 |
| コンボ(n) | +(n-1) |

## 無料枠制限

Cloudflare Workers Free プラン:
- 100,000 リクエスト/日
- 5 GB ストレージ
- Durable Objects (SQLite backend のみ)

## ライセンス

MIT
