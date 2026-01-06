---
title: "2048オンライン対戦で「公平」を実現する方法：シード乱数の魔法"
date: "2026-01-05"
publishDate: "2026-01-05"
description: "2048のオンライン対戦で両プレイヤーに同じタイル配置を保証するシード乱数の仕組みと、リアルタイム同期の実装方法を解説します。クライアント側でゲームロジックを実行しながら公平性を担保するテクニック。"
tags: ["2048", "シード乱数", "Cloudflare Workers", "WebSocket", "リアルタイム通信", "TypeScript", "ゲーム開発"]
author: "Adabana Saki"
category: "プログラミング"
---

# 2048オンライン対戦で「公平」を実現する方法

「2048の対戦版を作りたい」

そう思ったとき、最初にぶつかる壁は**公平性**です。2048は新しいタイルがランダムに出現するゲーム。対戦で両者に違うタイルが出てきたら、それは純粋に運ゲーになってしまいます。

この記事では、**シード乱数**を使って2048対戦の公平性を実現する方法と、リアルタイム同期の実装を解説します。

## 公平な対戦とは？

### 2048のランダム要素

2048には2つの重要なランダム要素があります：

1. **初期タイル**: ゲーム開始時に2つのタイルが配置される
2. **新規タイル**: 移動後に新しいタイル（2か4）が出現する

```text
【ランダム要素の例】

ゲーム開始時:
┌────┬────┬────┬────┐
│    │    │  2 │    │ ← ランダムな位置
├────┼────┼────┼────┤
│    │    │    │    │
├────┼────┼────┼────┤
│    │  2 │    │    │ ← ランダムな位置
├────┼────┼────┼────┤
│    │    │    │    │
└────┴────┴────┴────┘

移動後:
新しいタイル(2か4) → ランダムな空きマスに出現
```

対戦では、両プレイヤーに**まったく同じランダム結果**を提供する必要があります。

### シード乱数という解決策

**シード乱数**は、「種（シード）」となる数値から**決定的な乱数列**を生成します。

```text
【シード乱数の仕組み】

シード: 42
    ↓
プレイヤーA: 0.73 → 0.21 → 0.89 → ...
プレイヤーB: 0.73 → 0.21 → 0.89 → ...

同じシードなら同じ乱数列！
```

これにより、サーバーは**シード値だけ**を両プレイヤーに送れば、両者が同じタイル配置でプレイできます。

## シード乱数生成器の実装

### 線形合同法

最もシンプルで高速なシード乱数は「**線形合同法（LCG）**」です：

```typescript
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) {
      this.seed += 2147483646;
    }
  }

  /**
   * 0〜1の乱数を生成（0以上1未満）
   */
  next(): number {
    // Park-Miller法のパラメータ
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  /**
   * min以上max未満の整数を生成
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }
}
```

### なぜこのパラメータ？

```text
線形合同法の公式: Xn+1 = (a × Xn) mod m

Park-Miller法のパラメータ:
- a = 16807 (7^5)
- m = 2147483647 (2^31 - 1、メルセンヌ素数)

このパラメータの特徴:
- 周期が最大（約21億）
- 統計的にも十分な品質
- 計算が高速
```

## 2048でのタイル配置

### 初期タイルの配置

ゲーム開始時、同じシードから同じ初期配置を生成します：

```typescript
// ゲーム初期化
const rng = createSeededRandom(seed);  // サーバーから受け取ったシード

const newGrid = createEmptyGrid();
addSeededTile(newGrid, rng);  // 1つ目のタイル
addSeededTile(newGrid, rng);  // 2つ目のタイル
```

### タイル配置関数

```typescript
const addSeededTile = (
  grid: Grid,
  rng: SeededRandom
): Tile | null => {
  // 空きマスを取得
  const emptyCells = getEmptyCells(grid);
  if (emptyCells.length === 0) return null;

  // 空きマスの中からランダムに選択
  const idx = rng.nextInt(0, emptyCells.length);
  const { row, col } = emptyCells[idx];

  // 90%で2、10%で4
  const value = rng.next() < 0.9 ? 2 : 4;

  const tile: Tile = {
    id: generateTileId(),
    value,
    row,
    col,
    isNew: true
  };
  grid[row][col] = tile;
  return tile;
};
```

### 両プレイヤーで同じ結果になる理由

```text
【同期の流れ】

サーバー → シード: 42 を送信

プレイヤーA                    プレイヤーB
rng = SeededRandom(42)        rng = SeededRandom(42)
    │                              │
    ▼                              ▼
rng.nextInt(0, 16) → 7        rng.nextInt(0, 16) → 7
(1つ目: 7番目の空きマス)       (1つ目: 7番目の空きマス)
    │                              │
    ▼                              ▼
rng.next() → 0.73 > 0.1       rng.next() → 0.73 > 0.1
(値: 2)                        (値: 2)
    │                              │
    ▼                              ▼
rng.nextInt(0, 15) → 3        rng.nextInt(0, 15) → 3
(2つ目: 3番目の空きマス)       (2つ目: 3番目の空きマス)
    │                              │
    ...                            ...

→ 完全に同じ盤面！
```

重要なのは、**乱数を呼び出す順序**が両者で同じであること。移動の操作ごとに1回`addSeededTile`を呼ぶので、同じ手順でプレイすれば同じ結果になります。

## グリッド操作の実装

### 回転によるスライド処理の統一

2048は4方向にスライドできますが、実装では「**左にスライド**」だけを実装し、グリッドを回転させることで全方向に対応しています：

```typescript
const executeMove = (
  grid: Grid,
  direction: Direction
): { newGrid: Grid; scoreGained: number; moved: boolean } => {
  let workingGrid = cloneGrid(grid);

  // 方向に応じてグリッドを回転
  const rotations = {
    up: 3,     // 反時計回りに3回 = 時計回りに1回
    right: 2,  // 180度回転
    down: 1,   // 時計回りに1回
    left: 0    // 回転なし
  }[direction];

  // 回転
  for (let i = 0; i < rotations; i++) {
    workingGrid = rotateGridClockwise(workingGrid);
  }

  // 左にスライド＆マージ
  for (let row = 0; row < 4; row++) {
    const { newRow, scoreGained } = slideAndMergeRow(workingGrid[row]);
    workingGrid[row] = newRow;
    totalScore += scoreGained;
  }

  // 元の向きに戻す
  for (let i = 0; i < (4 - rotations) % 4; i++) {
    workingGrid = rotateGridClockwise(workingGrid);
  }

  return { newGrid: workingGrid, scoreGained, moved };
};
```

### グリッドの時計回り回転

```typescript
const rotateGridClockwise = (grid: Grid): Grid => {
  const newGrid = createEmptyGrid();
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const tile = grid[row][col];
      if (tile) {
        // (row, col) → (col, 3-row)
        newGrid[col][3 - row] = {
          ...tile,
          row: col,
          col: 3 - row
        };
      }
    }
  }
  return newGrid;
};
```

```text
【回転のイメージ】

元のグリッド:          時計回り90度:
┌──┬──┬──┬──┐         ┌──┬──┬──┬──┐
│A │B │C │D │         │M │I │E │A │
├──┼──┼──┼──┤         ├──┼──┼──┼──┤
│E │F │G │H │   →     │N │J │F │B │
├──┼──┼──┼──┤         ├──┼──┼──┼──┤
│I │J │K │L │         │O │K │G │C │
├──┼──┼──┼──┤         ├──┼──┼──┼──┤
│M │N │O │P │         │P │L │H │D │
└──┴──┴──┴──┘         └──┴──┴──┴──┘
```

### スライドとマージ

```typescript
const slideAndMergeRow = (row: (Tile | null)[]): {
  newRow: (Tile | null)[];
  scoreGained: number;
} => {
  let scoreGained = 0;
  const tiles = row.filter((tile): tile is Tile => tile !== null);
  const newRow: (Tile | null)[] = Array(4).fill(null);

  let writeIndex = 0;
  for (let i = 0; i < tiles.length; i++) {
    const current = tiles[i];
    const next = tiles[i + 1];

    if (next && current.value === next.value) {
      // マージ
      const newValue = current.value * 2;
      newRow[writeIndex] = {
        id: generateTileId(),
        value: newValue,
        row: current.row,
        col: writeIndex,
        mergedFrom: [current, next],  // アニメーション用
      };
      scoreGained += newValue;
      i++;  // 次のタイルをスキップ
    } else {
      // スライドのみ
      newRow[writeIndex] = { ...current, col: writeIndex };
    }
    writeIndex++;
  }

  return { newRow, scoreGained };
};
```

## サーバー側の実装

### Durable Objectでルーム管理

```typescript
export class Game2048Room extends DurableObject<Env> {
  private sessions: Map<WebSocket, WebSocketSession> = new Map();
  private roomState: Game2048RoomState;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.roomState = {
      roomId: '',
      players: new Map(),
      gameStatus: 'waiting',
      seed: 0,            // ← これが公平性の鍵！
      timeLimit: 180,     // 3分
      targetTile: 2048,
      createdAt: Date.now(),
    };
  }
}
```

### ゲーム開始時のシード生成

```typescript
private startGame(): void {
  this.roomState.gameStatus = 'playing';
  this.roomState.startTime = Date.now();

  // シードを生成
  this.roomState.seed = Math.floor(Math.random() * 2147483647);

  // 両プレイヤーに同じシードを送信
  this.broadcast({
    type: 'game_start',
    seed: this.roomState.seed,  // 両者に同じシード
    timeLimit: this.roomState.timeLimit,
    targetTile: this.roomState.targetTile,
  });
}
```

### スコアのリアルタイム同期

2048はクライアント側でゲームロジックを実行しますが、スコアは定期的にサーバーに送信します：

```typescript
// クライアント側: 移動のたびに送信
onMoveUpdate(newScore, newMaxTile, newMoves, simpleGrid);

// サーバー側: 相手に転送
private async handleMoveUpdate(session, data) {
  const player = this.roomState.players.get(session.playerId);
  if (!player) return;

  player.score = data.score;
  player.maxTile = data.maxTile;
  player.moves = data.moves;

  // 相手にブロードキャスト
  this.broadcastExcept(session.playerId, {
    type: 'opponent_update',
    id: session.playerId,
    score: data.score,
    maxTile: data.maxTile,
    moves: data.moves,
    grid: data.grid,  // 盤面も送信して表示
  });
}
```

## クライアント側の実装

### React Hookでの状態管理

```typescript
export function use2048Battle(options) {
  const [gameStatus, setGameStatus] = useState('disconnected');
  const [opponent, setOpponent] = useState(null);
  const [winner, setWinner] = useState(null);

  const handleMessage = useCallback((event) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
      case 'game_start':
        setGameStatus('playing');
        // シードでゲームを初期化
        options.onGameStart?.(data.seed, {
          timeLimit: data.timeLimit,
          targetTile: data.targetTile,
        });
        break;

      case 'opponent_update':
        setOpponent({
          id: data.id,
          score: data.score,
          maxTile: data.maxTile,
          moves: data.moves,
          grid: data.grid,
        });
        break;

      case 'game_end':
        setWinner({ id: data.winner, nickname: data.winnerNickname });
        break;
    }
  }, [options]);

  // ...
}
```

### ゲームコンポーネントでのシード初期化

```typescript
// Game2048Battle.tsx
useEffect(() => {
  // シードからRNGを初期化
  const rng = createSeededRandom(seed);
  rngRef.current = rng;

  // 初期タイルを配置
  const newGrid = createEmptyGrid();
  addSeededTile(newGrid, rng);
  addSeededTile(newGrid, rng);

  setGrid(newGrid);
}, [seed]);  // シードが変わるたびに再初期化
```

## 勝敗判定のロジック

### 勝利条件

2048対戦には複数の勝利条件があります：

| 条件 | 説明 |
|------|------|
| 2048達成 | 最初に2048を作ったプレイヤーが勝利 |
| 時間切れ | スコアが高い方が勝利 |
| 相手ゲームオーバー | 相手が動けなくなったら5秒後に判定 |
| 退出 | 相手が離脱したら自動勝利 |

### 2048達成時の処理

```typescript
// クライアント側
if (newMaxTile >= settings.targetTile) {
  setReachedTarget(true);
  onReachedTarget(newScore, newMaxTile, newMoves);
}

// サーバー側
private async handleReachedTarget(session, data) {
  const player = this.roomState.players.get(session.playerId);
  player.reachedTarget = true;

  // 最初に達成した人が勝ち
  this.endGame(player.id, 'reached_target');
}
```

### 片方がゲームオーバーになった場合

```typescript
// サーバー側
private async handleGameOver(session, data) {
  const player = this.roomState.players.get(session.playerId);
  player.isFinished = true;

  // 相手に「5秒後に終了」を通知
  this.broadcastExcept(session.playerId, {
    type: 'opponent_game_over',
    id: session.playerId,
    score: data.score,
    forceEndIn: 5,  // 5秒猶予
  });

  // 5秒後にスコアで判定
  setTimeout(() => {
    if (this.roomState.gameStatus === 'playing') {
      this.endGameByScore();
    }
  }, 5000);
}
```

この「5秒ルール」により、相手がゲームオーバーになっても少し時間をもらえます。逆転の可能性を残しつつ、無限に待たされることも防ぎます。

## 相手の盤面表示

対戦の緊張感を高めるため、相手の盤面もリアルタイムで表示します：

```typescript
// ミニグリッド表示コンポーネント
function MiniGridComponent({ grid }: { grid?: (number | null)[][] }) {
  if (!grid) return null;

  return (
    <div className="grid-container">
      {grid.flat().map((value, i) => {
        const style = value ? getTileStyle(value) : emptyStyle;
        return (
          <div key={i} className={style.bg}>
            {value || ''}
          </div>
        );
      })}
    </div>
  );
}
```

これにより、相手がどんな状況かを把握しながらプレイできます。

## アニメーションの実装

Framer Motionを使って、タイルのアニメーションを実装しています：

```typescript
function TileComponent({ tile, cellSize }) {
  return (
    <motion.div
      key={tile.id}
      initial={
        tile.isNew
          ? { scale: 0, opacity: 0 }      // 新規タイル: 拡大登場
          : tile.mergedFrom
          ? { scale: 1.2 }                // マージ: 少し大きく
          : { scale: 1 }                  // 通常: そのまま
      }
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        duration: 0.15
      }}
      style={{
        left: tile.col * (cellSize + 4) + 4,
        top: tile.row * (cellSize + 4) + 4,
      }}
    >
      {tile.value}
    </motion.div>
  );
}
```

タイルのIDを使って、Reactが正しくアニメーションを追跡できるようにしています。

## まとめ

| 技術要素 | 採用した解決策 |
|----------|----------------|
| 公平性 | シード乱数で同じタイル配置を保証 |
| 通信 | WebSocket（Durable Objects） |
| ロジック | クライアント側で実行（レスポンス向上） |
| 同期 | スコアと盤面を定期送信 |
| アニメーション | Framer Motion |

シード乱数を使うことで、**サーバーはシード値を1回送るだけ**で公平な対戦を実現できます。クライアント側でゲームロジックを実行するため、レスポンスも良好です。

この「シードだけ共有してクライアントで計算」というパターンは、他のパズルゲームやローグライクにも応用できます。

## 遊んでみる

実際に2048バトルを遊んでみたい方は、こちらからどうぞ：

- [2048バトルで遊ぶ](https://adalabtech.com/games/2048/battle)

## ソースコード

この記事で紹介したコードの完全版はGitHubで公開しています：

- [Game2048Room.ts（サーバー側）](https://github.com/adabana-saki/ADALab/blob/main/workers/tetris-battle/src/Game2048Room.ts)
- [use2048Battle.ts（クライアントHook）](https://github.com/adabana-saki/ADALab/blob/main/hooks/use2048Battle.ts)
- [Game2048Battle.tsx（UIコンポーネント）](https://github.com/adabana-saki/ADALab/blob/main/components/games/Game2048Battle.tsx)
- [seededRandom.ts（シード乱数）](https://github.com/adabana-saki/ADALab/blob/main/lib/seededRandom.ts)

## このシリーズの他の記事

このサイトでは、他にもオンライン対戦ゲームの実装記事を公開しています：

- [同一フィールドで戦うスネークバトルを実装してみた](/blog/snake-battle-implementation) - Durable Objectsでサーバー側ゲームロジック
- [日本語タイピングゲームの「shi」と「si」問題を解決する](/blog/typing-game-romaji-converter) - 150以上のローマ字パターンに対応
- [テトリスは運ゲーじゃない！7-bagアルゴリズムとマルチプレイ同期の仕組み](/blog/tetris-7bag-algorithm-and-random-sync) - 7-bagとシード乱数の解説

## 参考リンク

- [2048 - Wikipedia](https://ja.wikipedia.org/wiki/2048_%28%E3%82%B2%E3%83%BC%E3%83%A0%29)
- [Linear congruential generator - Wikipedia](https://en.wikipedia.org/wiki/Linear_congruential_generator)
- [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [Framer Motion](https://www.framer.com/motion/)
