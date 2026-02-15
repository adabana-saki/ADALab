---
title: "同一フィールドで戦うスネークバトルを実装してみた"
date: "2026-01-04"
publishDate: "2026-01-04"
description: "Cloudflare Durable Objectsを使ったリアルタイムスネークバトルゲームの実装解説。サーバー側でのゲームロジック処理、衝突判定、WebSocketによる状態同期の仕組みを詳しく紹介します。"
tags: ["スネークゲーム", "Cloudflare Workers", "Durable Objects", "WebSocket", "リアルタイム通信", "TypeScript", "ゲーム開発"]
author: "Adabana Saki"
category: "プログラミング"
---

# 同一フィールドで戦うスネークバトルを実装してみた

「スネークゲームの対戦版を作ろう」

そう思い立ったとき、最初に考えたのは「どうやって2匹のスネークを同じフィールドで戦わせるか」でした。

この記事では、**Cloudflare Durable Objects**を使って実装した**リアルタイムスネークバトル**の技術的な裏側を解説します。

## 完成したもの

まずは完成したゲームの概要です：

- **同一フィールド対戦**: 2人のプレイヤーが30×30のグリッド上で対戦
- **リアルタイム同期**: 100msごとにゲーム状態を同期（10 FPS）
- **多様な衝突判定**: 壁、自分の体、相手の体、正面衝突
- **クイックマッチ**: ランダムなプレイヤーとすぐに対戦可能

## なぜサーバー側でゲームロジックを実行するのか？

### クライアント側実行の問題点

スネークゲームをクライアント側で実行する場合、いくつかの問題があります：

```text
【クライアント側実行の問題】

プレイヤーA              プレイヤーB
    │                        │
    ▼                        ▼
 自分のスネーク             自分のスネーク
 を計算                     を計算
    │                        │
    ▼                        ▼
 相手に送信  ─────────────▶ 受信
    │        ネットワーク    │
 受信 ◀───────────遅延────── 相手に送信

→ お互いの画面で位置がずれる！
→ 衝突判定の結果が食い違う！
```

特に「正面衝突」のような判定では、**どちらが先に衝突したか**で勝敗が変わってしまいます。

### サーバー側実行のメリット

サーバーを**唯一の信頼できる情報源（Single Source of Truth）**にすることで、この問題を解決できます：

```text
【サーバー側実行のメリット】

プレイヤーA              サーバー             プレイヤーB
    │                      │                      │
 方向変更 ─────────────▶   │                      │
    │                   ゲームロジック            │
    │                   を計算                    │
    │                      │   ◀───────────── 方向変更
    │                      │
    │  ◀──── 状態を配信 ────┼──── 状態を配信 ────▶  │
    │                      │                      │

→ 両プレイヤーに同じ状態が届く
→ 衝突判定は1箇所で行われる
```

## Cloudflare Durable Objectsの採用

### なぜDurable Objectsなのか？

リアルタイムゲームサーバーには以下の要件があります：

| 要件 | Durable Objectsの対応 |
|------|----------------------|
| WebSocket対応 | ネイティブサポート |
| ステートフル | オブジェクト内で状態を保持 |
| 低レイテンシ | エッジで実行される |
| スケーラビリティ | 自動的にスケール |

通常のサーバーレス関数（AWS Lambda等）は**ステートレス**なので、ゲームの状態を外部に保存する必要があります。Durable Objectsは**ステートフル**なので、ゲーム状態をメモリに保持できます。

### ルーム構造

```typescript
export class SnakeRoom extends DurableObject<Env> {
  private sessions: Map<WebSocket, WebSocketSession> = new Map();
  private roomState: SnakeRoomState;
  private gameLoopInterval?: ReturnType<typeof setInterval>;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.roomState = {
      roomId: '',
      players: new Map(),
      gameStatus: 'waiting',
      food: { x: 15, y: 15 },
      gridSize: 30,
      timeLimit: 0,
      createdAt: Date.now(),
    };
  }
}
```

各ルームが独立したDurable Objectとして存在し、接続したプレイヤーの状態を管理します。

## ゲームループの実装

### 100msごとのティック

ゲームは**100ミリ秒ごと**にサーバー側で状態を更新します：

```typescript
private startGame(): void {
  this.roomState.gameStatus = 'playing';

  // ゲームループ開始（100msごと）
  this.gameLoopInterval = setInterval(() => {
    this.gameTick();
  }, 100);  // 10 FPS
}
```

「100msは遅くない？」と思うかもしれませんが、スネークゲームにはちょうど良いテンポです。古典的なスネークゲームも同様のスピードでした。

### ティック処理の流れ

```typescript
private gameTick(): void {
  // 1. 生存プレイヤーを取得
  const alivePlayers = Array.from(this.roomState.players.values())
    .filter(p => p.isAlive);

  // 2. 各プレイヤーのスネークを移動
  for (const player of alivePlayers) {
    // 方向の適用（180度反転は禁止）
    if (player.nextDirection !== opposite[player.direction]) {
      player.direction = player.nextDirection;
    }

    // 新しい頭の位置を計算
    const head = player.snake[0];
    let newHead: Position;
    switch (player.direction) {
      case 'up':    newHead = { x: head.x, y: head.y - 1 }; break;
      case 'down':  newHead = { x: head.x, y: head.y + 1 }; break;
      case 'left':  newHead = { x: head.x - 1, y: head.y }; break;
      case 'right': newHead = { x: head.x + 1, y: head.y }; break;
    }

    // 3. 衝突判定
    // 4. スネークの移動・成長
    // 5. 勝敗判定
  }

  // 6. 状態をブロードキャスト
  this.broadcast({ type: 'game_state', ... });
}
```

## 衝突判定の詳細

### 4種類の衝突

スネークバトルには4種類の衝突判定があります：

```typescript
// 死因の定義
type DeathReason = 'wall' | 'self' | 'opponent' | 'opponent_body';
```

それぞれの判定を見ていきましょう。

### 1. 壁衝突

```typescript
if (newHead.x < 0 || newHead.x >= this.roomState.gridSize ||
    newHead.y < 0 || newHead.y >= this.roomState.gridSize) {
  player.isAlive = false;
  this.broadcast({
    type: 'player_died',
    id: player.id,
    killedBy: 'wall'
  });
}
```

グリッドの範囲外に出たら壁に衝突したと判定します。

### 2. 自分の体への衝突

```typescript
if (player.snake.some(seg =>
    seg.x === newHead.x && seg.y === newHead.y)) {
  player.isAlive = false;
  this.broadcast({
    type: 'player_died',
    id: player.id,
    killedBy: 'self'
  });
}
```

自分のスネークの体と新しい頭の位置が重なったらアウト。

### 3. 正面衝突（両者死亡）

```typescript
// 相手の新しい頭の位置を計算
const otherNewHead = this.getNewHead(other);

// 同じ位置に移動しようとしている場合
if (newHead.x === otherNewHead.x &&
    newHead.y === otherNewHead.y) {
  player.isAlive = false;
  other.isAlive = false;
  this.broadcast({
    type: 'player_died',
    id: player.id,
    killedBy: 'opponent'
  });
  this.broadcast({
    type: 'player_died',
    id: other.id,
    killedBy: 'opponent'
  });
}
```

これが一番面白い判定です。両者が同じマスに移動しようとした場合、**両方とも死亡**します。この場合はスコアで勝敗を決めます。

### 4. 相手の体への衝突

```typescript
if (other.snake.some(seg =>
    seg.x === newHead.x && seg.y === newHead.y)) {
  player.isAlive = false;
  this.broadcast({
    type: 'player_died',
    id: player.id,
    killedBy: 'opponent_body'
  });
}
```

相手のスネークの体に突っ込んだ場合。相手は無傷です。

## プレイヤーの初期配置

対戦ゲームとして公平にするため、プレイヤーは**対角線上に配置**されます：

```typescript
players.forEach((player, index) => {
  if (index === 0) {
    // プレイヤー1: 左上から右向き
    player.snake = [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ];
    player.direction = 'right';
  } else {
    // プレイヤー2: 右下から左向き
    player.snake = [
      { x: gridSize - 6, y: gridSize - 6 },
      { x: gridSize - 5, y: gridSize - 6 },
      { x: gridSize - 4, y: gridSize - 6 },
    ];
    player.direction = 'left';
  }
});
```

```text
【初期配置図】

     0   1   2   3   4   5   6   ...  24  25  26
   ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐
 0 │   │   │   │   │   │   │   │   │   │   │   │
   ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
 5 │   │   │   │ ● │ ● │ ● │   │   │   │   │   │ ← プレイヤー1
   ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
   │   │   │   │   │   │   │   │   │   │   │   │
   ...
   ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
24 │   │   │   │   │   │   │   │ ○ │ ○ │ ○ │   │ ← プレイヤー2
   ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
   └───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘
```

## クライアント側の実装

### 方向変更のみ送信

クライアントは**方向変更のみ**をサーバーに送信します：

```typescript
// React Hook
const sendDirectionChange = useCallback((direction: Direction) => {
  if (wsRef.current?.readyState === WebSocket.OPEN) {
    wsRef.current.send(JSON.stringify({
      type: 'direction_change',
      direction,
    }));
  }
}, []);
```

スネークの位置計算はすべてサーバー側で行い、クライアントは結果を描画するだけです。

### キーボード操作

```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  const opposites: Record<Direction, Direction> = {
    up: 'down', down: 'up',
    left: 'right', right: 'left',
  };

  let newDirection: Direction | null = null;

  switch (e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      newDirection = 'up';
      break;
    // ... 他の方向
  }

  // 180度反転は禁止
  if (newDirection && opposites[newDirection] !== currentDirection) {
    setCurrentDirection(newDirection);
    onDirectionChange(newDirection);
  }
};
```

クライアント側でも180度反転をブロックしていますが、最終的な判定はサーバー側で行います。これは**二重チェック**で、チート対策にもなっています。

### タッチ操作（モバイル対応）

```typescript
const handleTouchEnd = useCallback((e: React.TouchEvent) => {
  if (!touchStartRef.current) return;

  const touch = e.changedTouches[0];
  const dx = touch.clientX - touchStartRef.current.x;
  const dy = touch.clientY - touchStartRef.current.y;

  // スワイプの閾値（30px）
  if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;

  // 水平・垂直で大きい方を採用
  let newDirection: Direction;
  if (Math.abs(dx) > Math.abs(dy)) {
    newDirection = dx > 0 ? 'right' : 'left';
  } else {
    newDirection = dy > 0 ? 'down' : 'up';
  }

  onDirectionChange(newDirection);
}, [currentDirection, onDirectionChange]);
```

スワイプ操作で直感的に方向を変えられるようにしています。

## 死亡通知のアニメーション

誰かが死んだときは、全プレイヤーに通知を表示します：

```typescript
// 死亡通知を表示
useEffect(() => {
  if (lastDeath) {
    setDeathNotification(lastDeath);
    // 3秒後に消える
    const timer = setTimeout(() => setDeathNotification(null), 3000);
    return () => clearTimeout(timer);
  }
}, [lastDeath]);
```

Framer Motionを使ったアニメーションで、通知がスムーズに表示・非表示されます：

```tsx
<AnimatePresence>
  {deathNotification && (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Skull className="w-5 h-5" />
      {deathNotification.nickname}が
      {getDeathReasonText(deathNotification.killedBy)}で脱落！
    </motion.div>
  )}
</AnimatePresence>
```

## 勝敗判定のロジック

### 通常の勝利

```typescript
const stillAlive = Array.from(this.roomState.players.values())
  .filter(p => p.isAlive);

if (stillAlive.length === 1) {
  // 生き残った方が勝利
  this.endGame(stillAlive[0].id, 'opponent_died');
}
```

### 両者死亡の場合

```typescript
if (stillAlive.length === 0) {
  // 両者死亡 → スコアで判定
  const sorted = players.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    // 同点ならスネークの長さで判定
    return b.snake.length - a.snake.length;
  });
  this.endGame(sorted[0].id, 'opponent_died');
}
```

同時死亡でも必ず勝者を決定できる仕組みです。

## マッチメイキングの仕組み

### クイックマッチ

```typescript
const quickMatch = useCallback(async (nickname: string) => {
  const response = await fetch(
    `${BATTLE_WORKER_URL}/api/battle/snake/queue`,
    {
      method: 'POST',
      body: JSON.stringify({ nickname, playerId }),
    }
  );

  const data = await response.json();

  if (data.matched) {
    // マッチング成功 → ルームに接続
    await connectToRoom(data.wsUrl, nickname);
  } else {
    // マッチング待ち → ポーリング開始
    pollForMatch();
  }
}, []);
```

マッチング待ちの場合は、500msごとにサーバーをポーリングしてマッチを確認します。

## まとめ

| 技術要素 | 採用した解決策 |
|----------|----------------|
| ゲーム状態の同期 | サーバー側でロジック実行 |
| リアルタイム通信 | WebSocket（Durable Objects） |
| 衝突判定 | サーバー側で一元管理 |
| 公平性 | 対角線配置 + シード乱数 |
| モバイル対応 | スワイプ操作 |

サーバー側でゲームロジックを実行することで、**チート耐性**と**公平性**を両立できました。

Cloudflare Durable Objectsは、こういったステートフルなリアルタイムアプリケーションに最適です。従来のサーバーレスでは実現が難しかったゲームサーバーも、簡単に構築できるようになりました。

## 遊んでみる

実際にスネークバトルを遊んでみたい方は、こちらからどうぞ：

- [スネークバトルで遊ぶ](https://adalabtech.com/games/snake/battle)

## ソースコード

この記事で紹介したコードの完全版はGitHubで公開しています：

- [SnakeRoom.ts（サーバー側）](https://github.com/adabana-saki/ADALab/blob/main/workers/tetris-battle/src/SnakeRoom.ts)
- [useSnakeBattle.ts（クライアントHook）](https://github.com/adabana-saki/ADALab/blob/main/hooks/useSnakeBattle.ts)
- [SnakeBattle.tsx（UIコンポーネント）](https://github.com/adabana-saki/ADALab/blob/main/components/games/SnakeBattle.tsx)

## このシリーズの他の記事

このサイトでは、他にもオンライン対戦ゲームの実装記事を公開しています：

- [2048オンライン対戦で「公平」を実現する方法：シード乱数の魔法](/blog/2048-battle-seeded-random) - シード乱数で両プレイヤーに同じタイル配置を保証
- [日本語タイピングゲームの「shi」と「si」問題を解決する](/blog/typing-game-romaji-converter) - 150以上のローマ字パターンに対応
- [テトリスは運ゲーじゃない！7-bagアルゴリズムとマルチプレイ同期の仕組み](/blog/tetris-7bag-algorithm-and-random-sync) - 7-bagとシード乱数の解説

## 参考リンク

- [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [WebSocket API - MDN](https://developer.mozilla.org/ja/docs/Web/API/WebSocket)
- [Framer Motion](https://www.framer.com/motion/)
