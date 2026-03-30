---
title: "リバーシAIの作り方 - ランダムからαβ枝刈りまで段階的に実装する"
date: "2026-03-30"
publishDate: "2026-03-30"
description: "リバーシ（オセロ）AIを3段階の難易度で実装する方法を解説。ランダム選択から位置評価ヒューリスティック、そしてミニマックス法＋αβ枝刈りまで、実際のTypeScriptコードとともに段階的に学べます。"
tags: ["リバーシ", "オセロ", "AI", "アルゴリズム", "ミニマックス法", "αβ枝刈り", "ゲーム開発", "TypeScript"]
author: "Adabana Saki"
category: "プログラミング"
series: "othello-dev"
seriesOrder: 1
---

# リバーシAIの作り方 - ランダムからαβ枝刈りまで段階的に実装する

「リバーシのAIを作りたい」と思ったとき、何から始めますか？

いきなり最強のアルゴリズムを実装しようとすると、挫折しがちです。この記事では、**3段階の難易度**に分けてリバーシAIを段階的に実装していきます。実際に[ADA Labのリバーシゲーム](/games/othello)で動いているTypeScriptのコードを使って解説します。

```text
【3段階のAI】

Level 1: Easy   → ランダムに打つ
Level 2: Normal → 位置の良し悪しを考えて打つ
Level 3: Hard   → 数手先まで読んで最善手を打つ
```

## 盤面の表現

まず、リバーシの盤面をプログラムでどう表現するかを決めましょう。

### 8×8グリッドと数値

盤面は8×8の二次元配列で表現します。各マスの値は以下の通りです：

```text
0 = 空きマス
1 = 黒（先手）
2 = 白（後手）

【初期配置】
   0  1  2  3  4  5  6  7
0 [ ][ ][ ][ ][ ][ ][ ][ ]
1 [ ][ ][ ][ ][ ][ ][ ][ ]
2 [ ][ ][ ][ ][ ][ ][ ][ ]
3 [ ][ ][ ][○][●][ ][ ][ ]
4 [ ][ ][ ][●][○][ ][ ][ ]
5 [ ][ ][ ][ ][ ][ ][ ][ ]
6 [ ][ ][ ][ ][ ][ ][ ][ ]
7 [ ][ ][ ][ ][ ][ ][ ][ ]

● = 黒(1)  ○ = 白(2)
```

TypeScriptでは `number[][]` 型の二次元配列（`Board`型）として扱います。

### 石を挟む判定（getFlips）

リバーシの核心は「相手の石を挟んで裏返す」というルールです。ある位置に石を置いたとき、**8方向すべて**をチェックして、挟める石を探します。

```text
【8方向の探索】

  ↖ ↑ ↗
  ← ● →
  ↙ ↓ ↘

例: 黒(●)を (2,3) に置く場合

   2  3  4  5
2 [ ][●][ ][ ]    ← ここに置く
3 [ ][○][○][●]    → 右方向に○○●を発見！
                      ○○が挟まれているので裏返す
```

`getFlips(board, row, col, player)` は、指定位置に石を置いたときに裏返せる石の座標リストを返す関数です。この関数が返すリストが空でなければ、その位置は合法手ということになります。

### 合法手の列挙（getValidMoves）

`getValidMoves(board, player)` は、盤面上のすべての空きマスに対して `getFlips` を呼び出し、1つ以上裏返せるマスの座標を配列で返します。AIはこの合法手の中から次の一手を選びます。

## Level 1: Easy AI - ランダム選択

まずは最もシンプルなAIから始めましょう。**合法手の中からランダムに1つ選ぶ**だけです。

```typescript
function aiEasy(board: Board, player: CellState): [number, number] | null {
  const moves = getValidMoves(board, player);
  if (moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}
```

たった3行。これだけで「ルールに従って打てるAI」が完成します。

### なぜランダムAIが重要なのか？

「ランダムに打つだけなんて、AIじゃないでしょ？」と思うかもしれません。でも、ランダムAIには重要な役割があります。

```text
【ランダムAIの役割】

1. ベースライン  → 「これより弱いAIはない」という基準
2. デバッグ用    → ゲームロジックが正しく動くか確認
3. 初心者向け    → リバーシを始めたばかりの人の練習相手
4. 性能テスト    → 上位AIの強さを測る対戦相手
```

上位のAIを作ったとき、ランダムAIに勝率90%以上なければ何かがおかしい、という判断材料にもなります。

## Level 2: Normal AI - 位置評価ヒューリスティック

ランダムAIの次は、**「どのマスに打つのが有利か」を評価**するAIです。リバーシには、打つべき場所と打ってはいけない場所がはっきりあります。

### 位置の重みマトリックス

リバーシ経験者なら「角を取れ」というのは常識でしょう。これを数値化したのが**位置の重みマトリックス（Position Weight Matrix）**です。

```typescript
const POSITION_WEIGHTS = [
  [100, -20,  10,   5,   5,  10, -20, 100],
  [-20, -40,  -5,  -5,  -5,  -5, -40, -20],
  [ 10,  -5,   4,   2,   2,   4,  -5,  10],
  [  5,  -5,   2,   1,   1,   2,  -5,   5],
  [  5,  -5,   2,   1,   1,   2,  -5,   5],
  [ 10,  -5,   4,   2,   2,   4,  -5,  10],
  [-20, -40,  -5,  -5,  -5,  -5, -40, -20],
  [100, -20,  10,   5,   5,  10, -20, 100],
];
```

これを視覚的に表すと：

```text
【位置の価値マップ】

  ◎  ✕  ○  ・  ・  ○  ✕  ◎
  ✕  ✕✕ △  △  △  △  ✕✕ ✕
  ○  △  ○  ・  ・  ○  △  ○
  ・  △  ・  ・  ・  ・  △  ・
  ・  △  ・  ・  ・  ・  △  ・
  ○  △  ○  ・  ・  ○  △  ○
  ✕  ✕✕ △  △  △  △  ✕✕ ✕
  ◎  ✕  ○  ・  ・  ○  ✕  ◎

◎ = 角（100点）  最も価値が高い
○ = 辺（4〜10点）安定しやすい
・ = 中央（1〜5点）普通
✕ = Cスクエア（-20点）角を取られる危険
✕✕= Xスクエア（-40点）最も危険
△ = やや不利（-5点）
```

### なぜ角が100点なのか？

角に置いた石は**絶対に裏返されません**。リバーシでは端に到達した石は安定石（stable disc）と呼ばれ、ゲーム終了まで自分の石のままです。角はその最たるもので、角を起点に辺沿いの石も安定石にできます。

```text
【角の安定性】

●●●●●○○○     ← 角の●から連なる石は
●                     すべて安定石になる
●                     （絶対に裏返されない）
●
```

### なぜ角の隣が-20/-40点なのか？

**Cスクエア**（角の隣の辺のマス）と**Xスクエア**（角の斜め隣のマス）に打つと、相手に角を取らせてしまう可能性があります。

```text
【CスクエアとXスクエア】

  角   C          C = Cスクエア（-20点）
   C   X          X = Xスクエア（-40点）

例: Xスクエアに黒が打つと...

  [  ][ ]           [○][ ]
  [ ][●]    →      [  ][●]
                    ↑
                 白に角を取られる！
```

Xスクエアが-40点と最も低いのは、**斜め方向からの裏返しで直接角を献上する**危険性が最も高いからです。

### Normal AIの実装

位置の重みに加えて、**裏返せる石の数**もボーナスとして考慮します。

```typescript
function aiNormal(board: Board, player: CellState): [number, number] | null {
  const moves = getValidMoves(board, player);
  if (moves.length === 0) return null;

  let bestScore = -Infinity;
  let bestMove = moves[0];

  for (const [r, c] of moves) {
    const flips = getFlips(board, r, c, player);
    const score = POSITION_WEIGHTS[r][c] + flips.length * 2;
    if (score > bestScore) {
      bestScore = score;
      bestMove = [r, c];
    }
  }
  return bestMove;
}
```

スコアの計算式は：

```text
スコア = 位置の重み + 裏返せる石の数 × 2
```

たとえば、角（重み100）で3枚裏返せるなら `100 + 3×2 = 106点`。Xスクエア（重み-40）で5枚裏返せても `-40 + 5×2 = -30点`。角の方が圧倒的に高評価です。

このAIは**1手先しか見ない**（先読みしない）ものの、リバーシの定石に近い判断ができるため、ランダムAIよりずっと強くなります。

## Level 3: Hard AI - ミニマックス法＋αβ枝刈り

いよいよ本格的なゲームAIです。「**数手先まで読んで最善手を選ぶ**」ことで、Normal AIを大きく上回る強さを実現します。

### ミニマックス法とは？

ミニマックス法は、**相手も最善手を打ってくる**と仮定して、自分にとって最も良い手を探索するアルゴリズムです。

```text
【ミニマックス法のゲーム木】

              現在の盤面
             ／    ｜    ＼
           手A    手B    手C      ← 自分の手（最大化）
          ／＼   ／＼   ／＼
        a1  a2  b1  b2  c1  c2   ← 相手の手（最小化）
        |   |   |   |   |   |
       +5  -3  +2  +8  -1  +4   ← 盤面の評価値

相手の手（最小化層）:
  A → min(+5, -3) = -3
  B → min(+2, +8) = +2
  C → min(-1, +4) = -1

自分の手（最大化層）:
  max(-3, +2, -1) = +2 → 手Bを選択！
```

重要なのは、**自分は評価値を最大化したい**のに対し、**相手は評価値を最小化したい**という点です。自分が良い手を打っても、相手も最善で返してくる。その前提で最も良い結果になる手を選びます。

### αβ枝刈りで高速化

ミニマックス法の問題は**探索量の爆発**です。リバーシでは1手あたり平均10個程度の合法手があるため、5手先まで読むと 10^5 = 100,000 通りもの盤面を評価する必要があります。

**αβ枝刈り**は、「この先を調べても結果が変わらない」と分かった枝を切り落とすことで、探索を高速化します。

```text
【αβ枝刈りの具体例】

              根
             ／  ＼
           A       B                ← 最大化層
          ／＼    ／＼
        a1  a2  b1  b2             ← 最小化層
        |   |   |   |
       +5  -3  +2   ?

1. a1=+5 を調べる
2. a2=-3 を調べる → A = min(+5,-3) = -3
3. α = max(α, -3) → α = -3

4. b1=+2 を調べる → 暫定 B ≤ +2
   しかし α=-3 で、+2 > -3 なのでまだ続ける

5. ここでもし b1=-5 だった場合:
   B ≤ -5 が確定 → α=-3 より小さい
   → b2を調べる必要なし！（枝刈り）

【結果】
  枝刈りなし: 4ノード評価
  枝刈りあり: 3ノード評価（25%削減）
  深い木ではさらに劇的な効果
```

α（アルファ）は「最大化プレイヤーが保証できる最低スコア」、β（ベータ）は「最小化プレイヤーが保証できる最高スコア」を表します。`β ≤ α` になったら、その枝は調べる意味がないので打ち切ります。

### 実装コード

```typescript
function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  player: CellState,
  opponent: CellState
): number {
  const moves = getValidMoves(board, isMaximizing ? player : opponent);
  const oppMoves = getValidMoves(board, isMaximizing ? opponent : player);

  // 終了条件: 深さ0 or 両者パス
  if (depth === 0 || (moves.length === 0 && oppMoves.length === 0)) {
    return evaluate(board, player);
  }

  // パス: 手番を相手に渡す
  if (moves.length === 0) {
    return minimax(board, depth - 1, alpha, beta, !isMaximizing, player, opponent);
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const [r, c] of moves) {
      const newBoard = applyMove(board, r, c, player);
      const eval_ = minimax(newBoard, depth - 1, alpha, beta, false, player, opponent);
      maxEval = Math.max(maxEval, eval_);
      alpha = Math.max(alpha, eval_);
      if (beta <= alpha) break;  // β枝刈り
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const [r, c] of moves) {
      const newBoard = applyMove(board, r, c, opponent);
      const eval_ = minimax(newBoard, depth - 1, alpha, beta, true, player, opponent);
      minEval = Math.min(minEval, eval_);
      beta = Math.min(beta, eval_);
      if (beta <= alpha) break;  // α枝刈り
    }
    return minEval;
  }
}
```

注目すべきポイントが3つあります：

1. **パスの処理**: 合法手がないとき、`!isMaximizing` で手番を切り替えて再帰する
2. **`beta <= alpha` でbreak**: これがαβ枝刈りの本体。不要な探索を打ち切る
3. **`applyMove`で新しい盤面を作る**: 元の盤面を変更せず、コピーに対して石を置く（探索が壊れない）

### 盤面評価関数（evaluate）

ミニマックス法の「葉ノード」で呼ばれるのが評価関数です。盤面がどちらに有利かを数値で返します。この関数の精度がAIの強さを大きく左右します。

```typescript
function evaluate(board: Board, player: CellState): number {
  const opponent = player === 1 ? 2 : 1;
  let score = 0;

  // ① 位置評価
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === player) score += POSITION_WEIGHTS[r][c];
      else if (board[r][c] === opponent) score -= POSITION_WEIGHTS[r][c];
    }
  }

  // ② 角ボーナス
  const corners: [number, number][] = [[0,0],[0,7],[7,0],[7,7]];
  for (const [cr, cc] of corners) {
    if (board[cr][cc] === player) score += 50;
    else if (board[cr][cc] === opponent) score -= 50;
  }

  // ③ モビリティ（打てる手の数）
  const myMoves = getValidMoves(board, player).length;
  const oppMoves = getValidMoves(board, opponent).length;
  score += (myMoves - oppMoves) * 5;

  // ④ 終盤の石数カウント
  const { black, white } = countPieces(board);
  const total = black + white;
  const myPieces = player === 1 ? black : white;
  const oppPieces = player === 1 ? white : black;
  if (total > 50) {
    score += (myPieces - oppPieces) * 3;
  }

  return score;
}
```

評価関数は**4つの要素**を組み合わせています：

```text
【評価関数の4要素】

┌──────────────────────────────────────────┐
│  ① 位置評価（POSITION_WEIGHTS）          │
│     → 全マスの石を重みで評価             │
│     → 角=+100, Xスクエア=-40 など        │
├──────────────────────────────────────────┤
│  ② 角ボーナス（+50/-50）                 │
│     → 角の価値をさらに上乗せ             │
│     → ①と合わせて角1つ = 150点相当       │
├──────────────────────────────────────────┤
│  ③ モビリティ（×5）                      │
│     → 自分の合法手数 - 相手の合法手数     │
│     → 相手の選択肢を減らす戦略           │
├──────────────────────────────────────────┤
│  ④ 終盤の石数（total > 50 で発動、×3）   │
│     → 残り14マス以下で石数差を重視       │
│     → 最後は石の多さが勝敗を決める       │
└──────────────────────────────────────────┘
```

**モビリティ**はリバーシ特有の重要な概念です。自分の打てる手が多く、相手の打てる手が少ない状態は非常に有利です。相手を「打てる場所がない」状態（パス）に追い込むのが理想的な戦略です。

**終盤の石数カウント**が `total > 50`（残り14マス以下）で発動するのは、序盤・中盤では石の数より位置の方が重要だからです。しかし終盤では最終的な石の数が勝敗を決めるため、石数差を評価に加えます。

### 動的な探索深度

Hard AIの最後のポイントは、**ゲームの進行に応じて探索の深さを変える**ことです。

```typescript
function aiHard(board: Board, player: CellState): [number, number] | null {
  const moves = getValidMoves(board, player);
  if (moves.length === 0) return null;

  const opponent: CellState = player === 1 ? 2 : 1;
  let bestScore = -Infinity;
  let bestMove = moves[0];

  const { black, white } = countPieces(board);
  const empty = 64 - black - white;

  // 空きマスが12以下なら完全読み（最大10手）、それ以外は5手先読み
  const depth = empty <= 12 ? Math.min(empty, 10) : 5;

  for (const [r, c] of moves) {
    const newBoard = applyMove(board, r, c, player);
    const score = minimax(newBoard, depth - 1, -Infinity, Infinity, false, player, opponent);
    if (score > bestScore) {
      bestScore = score;
      bestMove = [r, c];
    }
  }
  return bestMove;
}
```

```text
【探索深度の切り替え】

序盤〜中盤（空きマス > 12）     終盤（空きマス ≤ 12）
  depth = 5                      depth = min(空きマス, 10)
  合法手が多い                   合法手が少ない
  5手先読みで十分                ほぼ完全読みが可能

ゲームの流れ:
開始 ─────────────────────────── 終了
  64マス空き                     0マス空き
  ├─── depth=5 ───┤├── depth=最大10 ──┤
                   ↑
              残り12マスで切替
```

なぜ中盤は深さ5で、終盤は最大10まで伸ばすのか？

- **中盤**: 合法手が多い（平均10手程度）ため、深く読むと計算量が爆発する。深さ5でも十分に強い手を選べる
- **終盤**: 合法手が急激に減る（3〜5手程度）ため、深く読んでも計算量は少ない。残り全手を読み切ることで**最善手を確実に選べる**

ブラウザ上で動作するため、思考時間が長すぎるとユーザー体験が悪くなります。深さ5は「強さ」と「応答速度」のバランスが取れた値です。

## 3段階のAI比較

最後に、3つのAIを比較してまとめます。

| | Easy | Normal | Hard |
|---|---|---|---|
| **アルゴリズム** | ランダム選択 | 位置評価＋裏返し数 | ミニマックス＋αβ枝刈り |
| **先読み** | なし | なし（現在の盤面のみ） | 5〜10手先 |
| **評価要素** | なし | 位置の重み、裏返し数 | 位置、角、モビリティ、石数 |
| **強さの目安** | 初心者未満 | 中級者程度 | 上級者程度 |
| **計算コスト** | O(1) | O(N) ※N=合法手数 | O(b^d) ※b=分岐数, d=深さ |
| **コード量** | 3行 | 12行 | 50行以上 |

```text
【強さのイメージ】

Easy   ●○○○○   → 適当に打つので大体負ける
Normal ●●●○○   → 定石に近い手を打つ
Hard   ●●●●○   → 先読みで確実に有利を取る
```

## まとめ

リバーシAIは段階的に実装することで、アルゴリズムの本質が理解しやすくなります。

1. **Easy（ランダム）**: ゲームのルールさえ分かればすぐ作れる。デバッグにも有用
2. **Normal（ヒューリスティック）**: ドメイン知識（角の重要性）をコードに落とし込む面白さ
3. **Hard（ミニマックス＋αβ枝刈り）**: 探索アルゴリズムの醍醐味。評価関数の設計がAIの強さを決める

ミニマックス法とαβ枝刈りは、リバーシだけでなくチェスや将棋、囲碁のAIにも使われている汎用的なアルゴリズムです。リバーシは盤面が8×8と比較的小さいため、これらのアルゴリズムを学ぶ入門として最適です。

次回の記事では、このリバーシをオンライン対戦に対応させる方法を解説します。Cloudflare Durable ObjectsとWebSocketを使ったリアルタイム通信の実装に踏み込みます。

実際に動くコードは [ADA Labのリバーシゲーム](/games/othello) で体験できます。3段階の難易度を切り替えて、AIの強さの違いを実感してみてください。
