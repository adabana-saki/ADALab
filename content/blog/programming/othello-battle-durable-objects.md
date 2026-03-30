---
title: "Cloudflare Durable Objectsでリバーシのリアルタイム対戦を実装する"
date: "2026-04-06"
publishDate: "2026-04-06"
description: "Cloudflare Workers の Durable Objects と WebSocket を使ってリバーシ（オセロ）のリアルタイムオンライン対戦を実装する方法を解説。サーバー権威型の設計、パス自動判定、ターン管理など、ボードゲーム特有の課題と解決策を紹介します。"
tags: ["リバーシ", "オセロ", "Cloudflare Workers", "Durable Objects", "WebSocket", "リアルタイム通信", "TypeScript", "ゲーム開発", "オンライン対戦"]
author: "Adabana Saki"
category: "プログラミング"
series: "othello-dev"
seriesOrder: 2
---

# Cloudflare Durable Objectsでリバーシのリアルタイム対戦を実装する

[前回の記事](/blog/othello-ai-algorithm)では、リバーシAIを3段階の難易度で実装しました。今回は、そのリバーシを**オンライン対戦**に対応させます。

「リアルタイム対戦」と聞くと複雑そうですが、**Cloudflare Durable Objects**を使えば、サーバーレスなのにステートフルなゲームサーバーを簡単に作れます。

## なぜDurable Objectsなのか？

ボードゲームのオンライン対戦には3つの要件があります：

```text
【ボードゲーム対戦の要件】

1. ステートフル    → 盤面の状態をサーバーで保持
2. リアルタイム    → 相手の手が即座に反映される
3. 低レイテンシー  → 世界中のプレイヤーが快適にプレイ
```

Durable Objectsはこの3つをすべて満たします：

```text
【従来のアプローチ vs Durable Objects】

従来（VPS + Redis + WebSocket サーバー）:
  ┌─────────┐    ┌────────┐    ┌─────────┐
  │ クライアント │←→│ Redisで │←→│ WSサーバー │
  └─────────┘    │ 状態管理 │    └─────────┘
                 └────────┘
  → サーバー管理、スケーリング、コスト...

Durable Objects:
  ┌─────────┐    ┌──────────────────┐
  │ クライアント │←→│  Durable Object   │
  └─────────┘    │  (状態 + WS 一体) │
                 └──────────────────┘
  → サーバーレス、自動スケール、使った分だけ課金
```

各「対戦部屋」が1つのDurable Objectインスタンスになります。部屋ごとに独立した状態を持ち、WebSocket接続も直接管理できます。

## アーキテクチャ全体像

```text
【システムアーキテクチャ】

  プレイヤーA                              プレイヤーB
  (ブラウザ)                               (ブラウザ)
      │                                       │
      │ WebSocket                    WebSocket │
      │                                       │
      └──────────┐              ┌──────────────┘
                 ↓              ↓
         ┌──────────────────────────┐
         │    Cloudflare Worker      │
         │   (ルーティング層)         │
         └──────────┬───────────────┘
                    ↓
         ┌──────────────────────────┐
         │   OthelloRoom            │
         │   (Durable Object)       │
         │                          │
         │  ┌─────────────────────┐ │
         │  │ roomState            │ │
         │  │  - board: Board     │ │
         │  │  - currentPlayer    │ │
         │  │  - status           │ │
         │  │  - timeLimit        │ │
         │  └─────────────────────┘ │
         │                          │
         │  ┌─────────────────────┐ │
         │  │ players: Map        │ │
         │  │  - id, nickname     │ │
         │  │  - color, isReady   │ │
         │  └─────────────────────┘ │
         │                          │
         │  ┌─────────────────────┐ │
         │  │ sessions: Map       │ │
         │  │  - WebSocket接続     │ │
         │  └─────────────────────┘ │
         └──────────────────────────┘
```

`OthelloRoom` クラスが `DurableObject` を継承し、盤面状態・プレイヤー情報・WebSocket接続の3つをまとめて管理します。

## 部屋のライフサイクル

対戦部屋は4つの状態を遷移します：

```text
【部屋の状態遷移】

  ┌─────────┐  2人揃って   ┌───────────┐  3秒後   ┌─────────┐
  │ waiting  │────Ready───→│ countdown │────────→│ playing │
  │(待機中)  │             │(カウント   │         │(対戦中) │
  └────┬─────┘             │  ダウン)   │         └────┬────┘
       ↑                   └─────┬─────┘              │
       │                         │                     │
       │  リマッチ               │ Ready解除           │ 決着
       │                         ↓                     ↓
       │                   ┌───────────┐         ┌──────────┐
       └───────────────────│ waiting   │←────────│ finished │
                           └───────────┘         │(終了)    │
                                                 └──────────┘
```

### 1. waiting（待機中）

プレイヤーが部屋に参加し、準備完了を待つフェーズです。

```typescript
private async handleJoin(ws: WebSocket, nickname: string, roomCode?: string): Promise<void> {
  if (this.players.size >= 2) {
    this.send(ws, { type: 'error', message: 'Room is full' });
    return;
  }

  const playerId = crypto.randomUUID();
  // 最初のプレイヤーは黒(1)、2番目は白(2)
  const color: CellState = this.players.size === 0 ? 1 : 2;

  const player: PlayerState = { id: playerId, nickname, isReady: false, color };
  this.players.set(playerId, player);
  this.sessions.set(ws, { playerId, nickname, ws });

  // 参加者に通知
  this.send(ws, {
    type: 'room_joined',
    roomId: this.roomState.roomId,
    roomCode: this.roomState.roomCode,
    players: this.getPlayerInfoList(),
    yourColor: color,
  });

  // 他のプレイヤーに新規参加を通知
  this.broadcastExcept(ws, {
    type: 'player_joined',
    player: { id: playerId, nickname, isReady: false, color },
  });
}
```

色の割り当てはシンプルに**先に入った人が黒（先手）**です。

### 2. countdown（カウントダウン）

2人ともReadyになると、3秒のカウントダウンが始まります：

```typescript
private startCountdown(): void {
  this.roomState.status = 'countdown';
  let seconds = 3;
  this.broadcast({ type: 'countdown', seconds });

  this.countdownInterval = setInterval(() => {
    seconds--;
    if (seconds > 0) {
      this.broadcast({ type: 'countdown', seconds });
    } else {
      this.clearCountdownInterval();
      this.startGame();
    }
  }, 1000);
}
```

カウントダウン中にReadyを解除すると、待機状態に戻ります。これにより「準備ができていないのにゲームが始まる」事態を防ぎます。

### 3. playing（対戦中）

ゲーム開始時に盤面をリセットし、10分のタイマーを開始します：

```typescript
private startGame(): void {
  this.roomState.status = 'playing';
  this.roomState.startTime = Date.now();
  this.roomState.board = createInitialBoard();
  this.roomState.currentPlayer = 1; // 黒先手

  const initialMoves = getValidMoves(this.roomState.board, 1);

  for (const [ws, session] of this.sessions.entries()) {
    const player = this.players.get(session.playerId);
    if (!player) continue;
    this.send(ws, {
      type: 'game_start',
      board: this.roomState.board,
      yourColor: player.color,
      currentPlayer: 1,
    });
  }

  // タイマー開始（10分制限）
  this.gameInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - this.roomState.startTime!) / 1000);
    const remaining = this.roomState.timeLimit - elapsed;
    if (remaining <= 0) {
      this.handleTimeout();
    } else if (remaining <= 60 || remaining % 30 === 0) {
      this.broadcast({ type: 'time_update', remaining });
    }
  }, 1000);
}
```

タイマーの通知は**残り60秒以下で毎秒**、それ以外は**30秒ごと**です。これでクライアントの負荷を抑えつつ、終盤の緊迫感を演出します。

### 4. finished（終了）→ リマッチ

ゲーム終了後、プレイヤーの状態をリセットして待機状態に戻します：

```typescript
// リマッチ用にリセット
for (const player of this.players.values()) {
  player.isReady = false;
}
this.roomState.status = 'waiting';
this.roomState.board = createInitialBoard();
this.roomState.currentPlayer = 1;
```

部屋自体は破棄せず、再びReadyすれば新しいゲームを始められます。

## サーバー権威型の設計

オンライン対戦で最も重要な設計判断が「**誰がゲームロジックを実行するか**」です。

```text
【クライアント信頼型 vs サーバー権威型】

クライアント信頼型（NG）:
  クライアント: 「(3,4)に置いて5枚裏返しました」
  サーバー:     「OK、そのまま相手に伝えます」
  → チート可能！不正な手や改ざんされた結果を送れる

サーバー権威型（採用）:
  クライアント: 「(3,4)に置きたいです」
  サーバー:     「検証... 合法手です。3枚裏返しました」
  → サーバーが全てを検証・計算するのでチート不可能
```

`OthelloRoom`では、クライアントから受け取るのは**座標だけ**です。裏返しの計算、合法手の判定、勝敗判定はすべてサーバー側で行います：

```typescript
private handleMove(ws: WebSocket, row: number, col: number): void {
  const session = this.sessions.get(ws);
  if (!session || this.roomState.status !== 'playing') return;

  const player = this.players.get(session.playerId);
  if (!player) return;

  // ① ターンチェック - 自分の番か？
  if (player.color !== this.roomState.currentPlayer) {
    this.send(ws, { type: 'error', message: 'Not your turn' });
    return;
  }

  // ② 範囲チェック - 盤面内か？
  if (!isInBounds(row, col)) {
    this.send(ws, { type: 'error', message: 'Invalid position' });
    return;
  }

  // ③ 合法手チェック - 裏返せる石があるか？
  const flips = getFlips(this.roomState.board, row, col, player.color);
  if (flips.length === 0) {
    this.send(ws, { type: 'error', message: 'Invalid move' });
    return;
  }

  // ④ 検証通過 → 手を適用
  this.roomState.board = applyMove(this.roomState.board, row, col, player.color);
  // ...
}
```

3段階のバリデーション（ターン → 範囲 → 合法手）を通過した手だけが盤面に反映されます。

## リバーシ特有の課題：パスの自動判定

リバーシには「**打てる場所がないときはパス**」というルールがあります。これはチェスや将棋にはない、リバーシ特有の仕組みです。

オンライン対戦では、パスの判定をサーバーが自動で行う必要があります。プレイヤーに「パス」ボタンを押させると、打てる場所があるのにパスする不正が可能になるためです。

### 3つのケース

手を適用した後、次にどうなるかは**3パターン**あります：

```text
【手の適用後の3パターン】

              手を適用
                │
        次のプレイヤーの
        有効手を確認
               │
      ┌────────┼────────┐
      ↓        ↓        ↓
    有効手    有効手     両者とも
    あり      なし      有効手なし
      │        │        │
  Case 1    Case 2    Case 3
  通常の     パス      ゲーム
  ターン交代  (自動)    終了
```

実装コードを見てみましょう：

```typescript
// 手を適用した後...
const nextPlayer: CellState = player.color === 1 ? 2 : 1;
const nextMoves = getValidMoves(this.roomState.board, nextPlayer);
const currentMoves = getValidMoves(this.roomState.board, player.color);

if (nextMoves.length > 0) {
  // Case 1: 相手に有効手あり → 通常のターン交代
  this.roomState.currentPlayer = nextPlayer;
  // 各プレイヤーに盤面更新を送信...

} else if (currentMoves.length > 0) {
  // Case 2: 相手に有効手なし、自分にはある → パス
  this.roomState.currentPlayer = player.color;  // 自分が続行
  // move_madeを送信後、パス通知を送信...

} else {
  // Case 3: 両者に有効手なし → ゲーム終了
  this.endGame(pieces);
}
```

### Case 2のパス処理を詳しく見る

パスが発生したとき、サーバーは2つのメッセージを送信します：

```text
【パス発生時のメッセージ順序】

1. move_made  → 「(3,4)に黒が置き、石が裏返りました」
2. player_passed → 「白はパスです。引き続き黒の手番です」

この順序が重要！
クライアントは move_made で盤面アニメーションを実行し、
その後 player_passed でパス通知を表示する。
```

```typescript
// Case 2: パス処理
// まず move_made を送信
for (const [sessionWs, sess] of this.sessions.entries()) {
  const p = this.players.get(sess.playerId);
  if (!p) continue;
  const myValidMoves = p.color === player.color ? currentMoves : [];
  this.send(sessionWs, {
    type: 'move_made',
    row, col, player: player.color, flips,
    board: this.roomState.board,
    currentPlayer: player.color,  // ← 自分が続行
    blackCount: pieces.black,
    whiteCount: pieces.white,
    validMoves: myValidMoves,
  });
}

// 次にパス通知を送信
for (const [sessionWs, sess] of this.sessions.entries()) {
  const p = this.players.get(sess.playerId);
  if (!p) continue;
  const myValidMoves = p.color === player.color ? currentMoves : [];
  this.send(sessionWs, {
    type: 'player_passed',
    player: nextPlayer,          // ← パスしたプレイヤー
    currentPlayer: player.color, // ← 続行するプレイヤー
    validMoves: myValidMoves,
  });
}
```

具体例で見てみましょう：

```text
【パスが起きる盤面の例】

   0  1  2  3  4  5  6  7
0 [●][●][●][●][●][●][●][●]
1 [●][●][●][●][●][●][●][●]
2 [●][●][●][●][●][●][●][ ]
3 [●][●][●][●][●][●][○][ ]
4 [●][●][●][●][●][○][ ][ ]
5 [●][●][●][●][○][ ][ ][ ]
6 [●][●][●][○][ ][ ][ ][ ]
7 [●][●][○][ ][ ][ ][ ][ ]

黒が大量に占有 → 白は置ける場所が極端に少ない
白の有効手が0になったら自動パス → 黒が連続で打てる
```

## 情報の隠蔽：プレイヤーごとの有効手

セキュリティ上重要なのが、**各プレイヤーに自分の有効手だけを送る**ことです：

```typescript
// 各プレイヤーに自分視点のvalidMovesを送信
for (const [sessionWs, sess] of this.sessions.entries()) {
  const p = this.players.get(sess.playerId);
  if (!p) continue;
  // 次のプレイヤーにだけ有効手を送り、もう一方には空配列
  const myValidMoves = p.color === nextPlayer ? nextMoves : [];
  this.send(sessionWs, {
    type: 'move_made',
    // ...
    validMoves: myValidMoves,
  });
}
```

```text
【情報の隠蔽】

黒のターン → 白のターンに切替

黒プレイヤーに送信:
  validMoves: []           ← 自分の手番じゃないので空

白プレイヤーに送信:
  validMoves: [[2,3],[4,5],[6,1]]  ← 打てる場所を表示
```

なぜこれが重要なのか？もし相手の有効手が分かると、「相手はここしか打てないから、その裏をかこう」という不公平な戦略が可能になります。リバーシでは有効手の数が戦略に直結するため、この隠蔽は公平性を保つために必要です。

## 切断への対応

オンライン対戦では、プレイヤーが突然切断する可能性を常に考慮する必要があります：

```typescript
private handlePlayerLeave(playerId: string): void {
  const player = this.players.get(playerId);
  if (!player) return;

  this.players.delete(playerId);
  this.broadcast({ type: 'player_left', playerId });

  // ゲーム中に切断 → 残ったプレイヤーの勝利
  if (this.roomState.status === 'playing') {
    const remainingPlayer = Array.from(this.players.values())[0];
    if (remainingPlayer) {
      const pieces = countPieces(this.roomState.board);
      this.endGameWithWinner(
        remainingPlayer.id,
        remainingPlayer.nickname,
        'opponent_left',
        pieces
      );
    }
  }

  // カウントダウン中に切断 → カウントダウン中止
  if (this.roomState.status === 'countdown') {
    this.cancelCountdown();
  }
}
```

```text
【切断時の処理】

待機中に切断:
  → 相手に player_left を通知
  → 新しいプレイヤーが入れる状態に

カウントダウン中に切断:
  → カウントダウンを中止
  → 待機状態に戻る

ゲーム中に切断:
  → 残ったプレイヤーの勝利（opponent_left）
  → 石数はその時点の状態で記録
```

WebSocketの`close`イベントと`error`イベントの両方で `handlePlayerLeave` を呼ぶことで、正常切断・異常切断の両方に対応しています。

## メッセージプロトコル

クライアントとサーバー間のメッセージは、すべてJSON形式で型安全に定義されています：

```text
【メッセージプロトコル】

クライアント → サーバー:
  ┌──────────────────────────────────────┐
  │ create_room  │ 部屋を作成            │
  │ join         │ 部屋に参加            │
  │ ready        │ 準備完了              │
  │ unready      │ 準備解除              │
  │ move         │ 石を置く (row, col)   │
  │ leave        │ 退出                  │
  │ ping         │ 接続確認              │
  └──────────────────────────────────────┘

サーバー → クライアント:
  ┌──────────────────────────────────────┐
  │ room_joined    │ 部屋参加成功         │
  │ player_joined  │ 相手が入室           │
  │ player_left    │ 相手が退室           │
  │ player_ready   │ Ready状態変更        │
  │ countdown      │ カウントダウン       │
  │ game_start     │ ゲーム開始           │
  │ move_made      │ 手が打たれた         │
  │ player_passed  │ パス発生             │
  │ game_end       │ ゲーム終了           │
  │ time_update    │ 残り時間更新         │
  │ error          │ エラー               │
  │ pong           │ 接続確認応答         │
  └──────────────────────────────────────┘
```

クライアントが送るメッセージは最小限（意図だけ）で、サーバーが返すメッセージには計算結果がすべて含まれています。これがサーバー権威型の特徴です。

## ゲーム終了の3パターン

ゲームが終了する条件は3つあります：

```text
【ゲーム終了条件】

① 両者パス → 通常の決着
   → 石数が多い方が勝ち、同数なら引き分け

② タイムアウト → 10分経過
   → その時点の石数で勝敗判定

③ 相手の切断 → opponent_left
   → 残ったプレイヤーが勝利
```

終了時には、両プレイヤーに詳細な結果を送信します：

```typescript
this.broadcast({
  type: 'game_end',
  winner: winnerId,
  winnerNickname,
  reason,  // 'more_pieces' | 'draw' | 'opponent_left'
  blackCount: pieces.black,
  whiteCount: pieces.white,
  results: [
    { id, nickname, color, pieces, status: 'won' | 'lost' | 'draw' },
    // ...
  ],
});
```

## まとめ

リバーシのオンライン対戦をDurable Objectsで実装するポイントをまとめます：

```text
【設計の要点】

┌─────────────────────────────────────────────┐
│ サーバー権威型                                │
│  → クライアントから座標だけ受け取る           │
│  → 合法性判定・石の反転・勝敗判定はサーバー   │
├─────────────────────────────────────────────┤
│ パスの自動判定                                │
│  → 3ケース分岐で確実に処理                    │
│  → プレイヤーに「パス」操作をさせない         │
├─────────────────────────────────────────────┤
│ 情報の隠蔽                                    │
│  → 各プレイヤーに自分の有効手のみ送信         │
│  → 相手の有効手は見えない                     │
├─────────────────────────────────────────────┤
│ 状態遷移の管理                                │
│  → waiting → countdown → playing → finished │
│  → リマッチでwaitingに戻る                    │
├─────────────────────────────────────────────┤
│ 切断対応                                      │
│  → フェーズごとに適切な処理                   │
│  → ゲーム中の切断は残った側の勝利             │
└─────────────────────────────────────────────┘
```

Durable Objectsの最大の利点は、**WebSocketの接続管理とゲーム状態の保持を1つのクラスにまとめられる**ことです。従来のようにRedisやデータベースで状態を外部管理する必要がなく、コードの見通しが良くなります。

次回の記事では、AIの「強さ」を決定する**評価関数の設計**に焦点を当て、位置評価・角の価値・モビリティ・終盤戦略の4要素を深掘りします。

実際のオンライン対戦は [ADA Labのリバーシゲーム](/games/othello) で体験できます。
