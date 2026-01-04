---
title: "テトリスは運ゲーじゃない！7-bagアルゴリズムとマルチプレイ同期の仕組み"
date: "2025-12-24"
description: "なぜテトリスは「運ゲー」ではないのか？公式ルールで採用されている7-bagアルゴリズムと、オンライン対戦で同じピース順を実現するシード乱数の仕組みを、実装コード付きで解説します。"
tags: ["テトリス", "アルゴリズム", "ゲーム開発", "JavaScript", "TypeScript", "乱数", "マルチプレイヤー"]
author: "Adabana Saki"
category: "プログラミング"
---

# テトリスは運ゲーじゃない！7-bagアルゴリズムの仕組み

「テトリスって結局、運ゲーでしょ？」

そう思っている方も多いかもしれません。でも実は、**公式テトリスには「運」を排除する巧妙な仕組み**があります。

この記事では、テトリスの**7-bagアルゴリズム**と、オンライン対戦で両プレイヤーに**同じピース順を配る仕組み**を、実際のコードと共に解説します。

## 7-bagアルゴリズムとは？

### 「完全ランダム」の問題点

もしピースが完全にランダムに出てきたらどうなるでしょう？

```text
実際に起こりうる最悪のケース:

S → Z → S → Z → S → Z → S → Z → ...

（Iミノが全然来ない！）
```

完全ランダムでは、理論上「永遠にIミノが来ない」ことも起こりえます。これでは運の要素が強すぎて、スキルゲームとして成立しません。

### 7-bagの解決策

**7-bag（セブンバッグ）**は、この問題を解決するアルゴリズムです。

```text
【7-bagの仕組み】

7種類のテトロミノを袋に入れる
        ↓
袋の中をシャッフル
        ↓
1つずつ取り出す（7回）
        ↓
袋が空になったら新しい7個を補充

┌─────────────────────────────────┐
│  袋の中身: I, O, T, S, Z, J, L  │
│         ↓ シャッフル           │
│  出力: T, I, L, O, Z, J, S      │
│         ↓ 空になったら         │
│  新しい袋: L, T, S, I, J, Z, O  │
└─────────────────────────────────┘
```

### 7-bagの保証

このアルゴリズムにより、以下が**数学的に保証**されます：

| 保証内容 | 詳細 |
|----------|------|
| **最大待ち時間** | どのピースも最大12個以内に必ず来る |
| **最小間隔** | 同じピースが連続することはない |
| **公平性** | 全プレイヤーが同じ条件でプレイ可能 |

```text
【最大12個の計算】

現在の袋: [_, _, _, _, _, _, X]  ← Xが最後
次の袋:    [_, _, _, _, _, X, _]  ← Xが6番目

最悪でも 6 + 6 = 12個以内に必ず来る！
```

## 実装してみよう

### Fisher-Yatesシャッフル

7-bagの実装には「**Fisher-Yates（フィッシャー・イェーツ）シャッフル**」を使います。

これは配列を**完全にランダム**かつ**均等な確率**でシャッフルするアルゴリズムです。

```typescript
// Fisher-Yatesシャッフル
function shuffle<T>(array: T[]): T[] {
  const result = [...array];

  // 配列の後ろから順に処理
  for (let i = result.length - 1; i > 0; i--) {
    // 0〜i の範囲でランダムなインデックスを選ぶ
    const j = Math.floor(Math.random() * (i + 1));
    // 要素を入れ替え
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

// 使用例
const pieces = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
console.log(shuffle(pieces));
// 例: ['T', 'I', 'L', 'O', 'Z', 'J', 'S']
```

### なぜFisher-Yatesなのか？

他のシャッフル方法と比較してみましょう：

| 方法 | 問題点 |
|------|--------|
| `array.sort(() => Math.random() - 0.5)` | 偏りが生じる（均等でない） |
| 単純なループでswap | 同じ要素が何度も動く可能性 |
| **Fisher-Yates** | 全ての並び順が等確率で出現 |

```javascript
// ❌ 悪い例：偏りが生じる
const bad = pieces.sort(() => Math.random() - 0.5);

// ✅ 良い例：Fisher-Yates
const good = shuffle(pieces);
```

### 7-bag生成器の完全実装

```typescript
// テトロミノの種類（1〜7の数字で表現）
const TETROMINO_TYPES = [1, 2, 3, 4, 5, 6, 7];
// 1=I, 2=O, 3=T, 4=S, 5=Z, 6=J, 7=L

class SevenBag {
  private bag: number[] = [];

  constructor() {
    this.refill();
  }

  // 袋を補充
  private refill(): void {
    this.bag = this.shuffle([...TETROMINO_TYPES]);
  }

  // Fisher-Yatesシャッフル
  private shuffle(array: number[]): number[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // 次のピースを取得
  next(): number {
    if (this.bag.length === 0) {
      this.refill();
    }
    return this.bag.pop()!;
  }

  // 次の数個をプレビュー（取り出さない）
  preview(count: number): number[] {
    // 足りない場合は一時的に補充
    while (this.bag.length < count) {
      const newBag = this.shuffle([...TETROMINO_TYPES]);
      this.bag = [...newBag, ...this.bag];
    }
    return this.bag.slice(-count).reverse();
  }
}

// 使用例
const bag = new SevenBag();
console.log(bag.next());      // 次のピース
console.log(bag.preview(3));  // 次の3個をプレビュー
```

## マルチプレイヤーでの同期問題

7-bagが実装できました。でも、**オンライン対戦**ではどうでしょう？

### 問題：各プレイヤーのピース順がバラバラ

```text
【同期なしの場合】

プレイヤーA: I → T → O → L → ...
プレイヤーB: S → Z → J → I → ...

これでは不公平！
```

### 解決策：シード付き乱数

**シード（種）**を使うことで、**同じ乱数列**を再現できます。

```text
【シード乱数の仕組み】

シード: 12345
    ↓
プレイヤーA: T → I → L → O → Z → J → S
プレイヤーB: T → I → L → O → Z → J → S

同じシードなら同じ順番！
```

## シード付き乱数生成器の実装

### 線形合同法（LCG）

最もシンプルなシード乱数の実装が「**線形合同法（Linear Congruential Generator）**」です。

```typescript
// シード付き乱数生成器
function createSeededRandom(seed: number): () => number {
  let state = seed;

  return () => {
    // 線形合同法の公式
    // state = (a * state + c) mod m
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

// 使用例
const random1 = createSeededRandom(12345);
const random2 = createSeededRandom(12345);

console.log(random1()); // 0.7825...
console.log(random2()); // 0.7825... ← 同じ値！

console.log(random1()); // 0.2134...
console.log(random2()); // 0.2134... ← 同じ値！
```

### 数学的な説明

```text
線形合同法の公式:

Xn+1 = (a × Xn + c) mod m

パラメータ（MINSTD標準）:
- a = 1103515245（乗数）
- c = 12345（増分）
- m = 2^31（モジュラス）

これにより、0〜2^31の範囲で周期的な乱数列が生成される
```

### 7-bagとシード乱数を組み合わせる

```typescript
// シード付き7-bag生成器
function createSeededBag(seed: number) {
  const random = createSeededRandom(seed);
  let bag: number[] = [];

  function shuffle(array: number[]): number[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function refill() {
    bag = shuffle([1, 2, 3, 4, 5, 6, 7]);
  }

  function next(): number {
    if (bag.length === 0) refill();
    return bag.pop()!;
  }

  return { next };
}

// 検証：同じシードなら同じ順番
const bag1 = createSeededBag(42);
const bag2 = createSeededBag(42);

for (let i = 0; i < 14; i++) {
  const piece1 = bag1.next();
  const piece2 = bag2.next();
  console.log(`${i + 1}個目: ${piece1} === ${piece2}: ${piece1 === piece2}`);
}

// 出力:
// 1個目: 3 === 3: true
// 2個目: 7 === 7: true
// ...すべてtrue
```

## オンライン対戦での実装例

### サーバー側：シードの生成と共有

```typescript
// サーバー側（Cloudflare Workers例）
class TetrisRoom {
  private gameSeed: number = 0;

  startGame() {
    // ゲーム開始時にシードを生成
    this.gameSeed = Math.floor(Math.random() * 2147483647);

    // 全プレイヤーに同じシードを送信
    this.broadcast({
      type: 'game_start',
      seed: this.gameSeed,
    });
  }
}
```

### クライアント側：シードを受け取って初期化

```typescript
// クライアント側
function onGameStart(seed: number) {
  // サーバーから受け取ったシードで初期化
  const bag = createSeededBag(seed);

  // これで両プレイヤーが同じピース順になる！
  startTetrisGame(bag);
}
```

### シーケンス図

```text
┌────────┐          ┌────────┐          ┌────────┐
│Server  │          │PlayerA │          │PlayerB │
└───┬────┘          └───┬────┘          └───┬────┘
    │                   │                   │
    │  game_start       │                   │
    │  seed: 12345      │                   │
    │──────────────────▶│                   │
    │──────────────────────────────────────▶│
    │                   │                   │
    │                   │ createSeededBag   │
    │                   │ (12345)           │
    │                   │                   │ createSeededBag
    │                   │                   │ (12345)
    │                   │                   │
    │                   │ 同じピース順！     │
    │                   │◀─────────────────▶│
```

## テストで正しさを検証

シード乱数が正しく動作することをテストで確認しましょう。

```typescript
import { describe, it, expect } from 'vitest';

describe('シード付き乱数', () => {
  it('同じシードで同じ結果を返す', () => {
    const random1 = createSeededRandom(12345);
    const random2 = createSeededRandom(12345);

    for (let i = 0; i < 100; i++) {
      expect(random1()).toBe(random2());
    }
  });

  it('異なるシードで異なる結果を返す', () => {
    const random1 = createSeededRandom(12345);
    const random2 = createSeededRandom(54321);

    // 最初の値が異なることを確認
    expect(random1()).not.toBe(random2());
  });

  it('0〜1の範囲の値を返す', () => {
    const random = createSeededRandom(99999);

    for (let i = 0; i < 1000; i++) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });
});

describe('7-bag', () => {
  it('7個以内に全種類が出現する', () => {
    const bag = createSeededBag(42);

    for (let round = 0; round < 10; round++) {
      const pieces = new Set<number>();

      for (let i = 0; i < 7; i++) {
        pieces.add(bag.next());
      }

      // 7種類すべてが出現
      expect(pieces.size).toBe(7);
    }
  });

  it('同じシードで同じ順番になる', () => {
    const bag1 = createSeededBag(12345);
    const bag2 = createSeededBag(12345);

    for (let i = 0; i < 21; i++) {  // 3ラウンド分
      expect(bag1.next()).toBe(bag2.next());
    }
  });
});
```

## 応用：お邪魔ブロックの穴位置

7-bagと同じ考え方は、**お邪魔ブロックの穴位置**にも使えます。

### ぷよぷよテトリスの仕様

ぷよぷよテトリスでは、お邪魔ブロックの穴位置に**70%継続ルール**があります：

```text
【70%継続ルール】

1段目の穴位置: ランダム（例: 3列目）
2段目の穴位置: 70%で同じ位置、30%で変更
3段目の穴位置: 70%で同じ位置、30%で変更
...
```

### 実装

```typescript
function addGarbageLines(
  field: number[][],
  lines: number,
  random: () => number  // シード乱数を使用
): number[][] {
  const FIELD_COL = 10;
  const newField = field.map(row => [...row]);

  // 最初の穴位置をランダムに決定
  let holePos = Math.floor(random() * FIELD_COL);

  for (let i = 0; i < lines; i++) {
    // フィールドを1行上にずらす
    newField.shift();

    // お邪魔ブロック行を作成（8 = グレー）
    const garbageLine = Array(FIELD_COL).fill(8);
    garbageLine[holePos] = 0;  // 穴を開ける
    newField.push(garbageLine);

    // 70%で同じ穴位置、30%で変更
    if (random() > 0.7) {
      holePos = Math.floor(random() * FIELD_COL);
    }
  }

  return newField;
}
```

### なぜ70%なのか？

| 確率 | プレイ体験 |
|------|------------|
| 100%（常に同じ） | 簡単すぎる。1列掘るだけで全消し |
| 0%（常に変更） | 難しすぎる。ランダムに近い |
| **70%** | 適度な難易度。戦略的に対処可能 |

## まとめ

| 概念 | 目的 | 実装方法 |
|------|------|----------|
| **7-bag** | 運要素を排除し公平に | Fisher-Yatesシャッフル |
| **シード乱数** | マルチプレイで同期 | 線形合同法（LCG） |
| **70%ルール** | お邪魔ブロックの難易度調整 | 確率的な穴位置継続 |

テトリスは「運ゲー」ではなく、**数学とアルゴリズムで設計されたスキルゲーム**です。

この記事で紹介した技術は、テトリスに限らず様々なゲーム開発に応用できます：

- カードゲームのデッキシャッフル
- ローグライクのダンジョン生成
- 対戦ゲームのマッチング条件

ぜひ自分のゲーム開発に活用してみてください！

## 完全な実装コード

この記事で紹介したコードの完全版は、GitHubで公開しています：

- [テトリス実装（ADA Lab）](https://github.com/adabana-saki/ADALab/blob/main/components/games/TetrisBattle.tsx)

## このシリーズの他の記事

このサイトでは、他にもオンライン対戦ゲームの実装記事を公開しています：

- [同一フィールドで戦うスネークバトルを実装してみた](/blog/snake-battle-implementation) - Durable Objectsでサーバー側ゲームロジック
- [2048オンライン対戦で「公平」を実現する方法：シード乱数の魔法](/blog/2048-battle-seeded-random) - シード乱数で両プレイヤーに同じタイル配置を保証
- [日本語タイピングゲームの「shi」と「si」問題を解決する](/blog/typing-game-romaji-converter) - 150以上のローマ字パターンに対応

## 参考リンク

- [Tetris Guideline - Tetris Wiki](https://tetris.wiki/Tetris_Guideline)
- [Fisher-Yates shuffle - Wikipedia](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
- [Linear congruential generator - Wikipedia](https://en.wikipedia.org/wiki/Linear_congruential_generator)
