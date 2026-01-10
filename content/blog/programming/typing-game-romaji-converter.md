---
title: "日本語タイピングゲームの「shi」と「si」問題を解決する"
date: "2026-01-06"
publishDate: "2026-01-06"
description: "タイピングゲームで「し」を「si」と入力しても正解にならない問題。複数のローマ字パターンに対応したマッチングアルゴリズムと、促音・「ん」の特殊処理を含む実装を解説します。"
tags: ["タイピングゲーム", "日本語入力", "ローマ字変換", "TypeScript", "アルゴリズム", "React"]
author: "Adabana Saki"
category: "プログラミング"
---

# 日本語タイピングゲームの「shi」と「si」問題を解決する

「なんで『si』って打ったのに間違いになるの？」

タイピングゲームを作ると必ずぶつかるこの問題。日本語には**複数のローマ字入力方法**があるのに、多くのタイピングゲームは1パターンしか受け付けません。

この記事では、**150以上のローマ字パターン**に対応したマッチングアルゴリズムと、促音（っ）や「ん」の特殊処理を含む実装を解説します。

## なぜ「shi」だけじゃダメなのか

### 日本語入力の多様性

日本語のローマ字入力には、複数の流派があります：

| ひらがな | ヘボン式 | 訓令式 | JIS X 4063 |
|----------|----------|--------|------------|
| し | shi | si | si |
| ち | chi | ti | ti |
| つ | tsu | tu | tu |
| ふ | fu | hu | hu |
| じ | ji | zi | zi |

さらにIMEごとの方言もあります（Microsoft IME、Google日本語入力、ATOK...）。

### ユーザーの期待

```text
ユーザーA: 「し」→ shi と入力したい
ユーザーB: 「し」→ si と入力したい
ユーザーC: 「し」→ ci と入力したい（これも動く！）

→ 全部正解にしたい！
```

## ローマ字変換テーブルの設計

### 基本構造

ひらがな1文字（または2文字）に対して、**複数のローマ字パターン**を配列で定義します：

```typescript
export const HIRAGANA_TO_ROMAJI: Record<string, string[]> = {
  // 基本母音（パターンは1つ）
  'あ': ['a'], 'い': ['i'], 'う': ['u'], 'え': ['e'], 'お': ['o'],

  // か行
  'か': ['ka'], 'き': ['ki'], 'く': ['ku'], 'け': ['ke'], 'こ': ['ko'],

  // さ行（「し」は3パターン！）
  'さ': ['sa'], 'し': ['shi', 'si', 'ci'], 'す': ['su'], 'せ': ['se'], 'そ': ['so'],

  // た行
  'た': ['ta'], 'ち': ['chi', 'ti'], 'つ': ['tsu', 'tu'], 'て': ['te'], 'と': ['to'],

  // ...
};
```

### 拗音（2文字）

拗音は2文字で1つの音なので、優先的にマッチングします：

```typescript
// 拗音 - しゃ行
'しゃ': ['sha', 'sya', 'siya'],
'しゅ': ['shu', 'syu', 'siyu'],
'しょ': ['sho', 'syo', 'siyo'],

// 拗音 - ちゃ行
'ちゃ': ['cha', 'tya', 'cya', 'tiya'],
'ちゅ': ['chu', 'tyu', 'cyu', 'tiyu'],
'ちょ': ['cho', 'tyo', 'cyo', 'tiyo'],

// 拗音 - じゃ行
'じゃ': ['ja', 'jya', 'zya', 'jiya', 'ziya'],
'じゅ': ['ju', 'jyu', 'zyu', 'jiyu', 'ziyu'],
'じょ': ['jo', 'jyo', 'zyo', 'jiyo', 'ziyo'],
```

### 外来語対応

最近のタイピングでは外来語も頻出：

```typescript
// ティ・ディ
'てぃ': ['thi', 'texi', 'teli', 'ti'],
'でぃ': ['dhi', 'dexi', 'deli', 'di'],

// ファ行
'ふぁ': ['fa', 'fua', 'hua'],
'ふぃ': ['fi', 'fui', 'hui'],
'ふぇ': ['fe', 'fue', 'hue'],
'ふぉ': ['fo', 'fuo', 'huo'],

// ヴ行
'ゔ': ['vu'],
'ゔぁ': ['va', 'vuxa'],
'ゔぃ': ['vi', 'vuxi', 'vyi'],
```

## 部分入力マッチング

### なぜ「部分一致」が必要か

タイピングゲームでは、ユーザーは1文字ずつ入力します。「sha」を打つ途中の「s」「sh」の段階でも、**まだ正解の可能性がある**と判定する必要があります。

```text
入力状況    判定
────────────────────
(空)       → 入力待ち
s          → 部分一致（sha, su, so...の可能性あり）
sh         → 部分一致（sha, shu, sho...の可能性あり）
sha        → 完全一致！「しゃ」確定
shax       → 不一致（×間違い）
```

### マッチング関数の実装

```typescript
export interface MatchResult {
  isValid: boolean;        // 入力が有効か
  confirmedChars: number;  // 確定したひらがなの文字数
  confirmedInput: string;  // 確定した入力文字列
  pendingInput: string;    // 未確定の入力
  isComplete: boolean;     // 完全に一致したか
}

export function matchPartialRomaji(
  hiragana: string,
  input: string
): MatchResult {
  let hiraganaIndex = 0;
  let inputIndex = 0;

  while (hiraganaIndex < hiragana.length && inputIndex < input.length) {
    const currentChar = hiragana[hiraganaIndex];

    // 拗音(2文字)を優先チェック
    const twoChar = hiragana.slice(hiraganaIndex, hiraganaIndex + 2);
    let patterns = HIRAGANA_TO_ROMAJI[twoChar];
    let charLength = 2;

    if (!patterns) {
      // 1文字でチェック
      patterns = HIRAGANA_TO_ROMAJI[currentChar];
      charLength = 1;
    }

    const remainingInput = input.slice(inputIndex);

    for (const pattern of patterns) {
      if (remainingInput.startsWith(pattern)) {
        // 完全一致 → 次の文字へ
        inputIndex += pattern.length;
        hiraganaIndex += charLength;
        break;
      } else if (pattern.startsWith(remainingInput)) {
        // 部分一致 → まだ入力中
        return { isValid: true, isComplete: false, ... };
      }
    }
  }

  // 入力が全て消費されたら成功
  return { isValid: true, isComplete: hiraganaIndex === hiragana.length, ... };
}
```

## 促音（っ）の処理

### 子音の重ね

「っ」は**次の文字の子音を重ねる**ことで入力します：

```text
「かっこ」 → kakko  （k + kakko）
「きって」 → kitte  （t + te）
「ざっし」 → zasshi （s + shi）
```

### 実装

```typescript
function getSokuonConsonants(text: string, index: number): string[] {
  const nextIndex = index + 1;
  if (nextIndex >= text.length) {
    // 文末の「っ」→ 直接入力のみ
    return ['xtu', 'ltu', 'xtsu', 'ltsu'];
  }

  // 次の文字のローマ字パターンを取得
  const nextChar = text[nextIndex];
  const romajiPatterns = HIRAGANA_TO_ROMAJI[nextChar];

  // 子音を抽出
  const consonants: string[] = [];
  for (const romaji of romajiPatterns) {
    const consonant = romaji[0];
    if ('kstcnhfmyrwgzdbpj'.includes(consonant)) {
      consonants.push(consonant);
    }
  }

  // 直接入力も追加
  return [...new Set(consonants), 'xtu', 'ltu', 'xtsu', 'ltsu'];
}
```

### マッチング時の処理

```typescript
if (currentChar === 'っ') {
  const sokuonPatterns = getSokuonConsonants(hiragana, hiraganaIndex);
  const remainingInput = input.slice(inputIndex);

  for (const pattern of sokuonPatterns) {
    if (remainingInput.startsWith(pattern)) {
      if (pattern.length <= 2 && 'kstcnhfmyrwgzdbpj'.includes(pattern[0])) {
        // 子音の重ね → 1文字だけ進める
        inputIndex += 1;
      } else {
        // 'xtu'等の直接入力
        inputIndex += pattern.length;
      }
      hiraganaIndex += 1;
      break;
    }
  }
}
```

## 「ん」の文脈依存処理

### 問題：「n」だけで確定できない場合

「ん」は通常`n`で入力できますが、次の文字によっては`nn`が必要です：

```text
「かんじ」 → kanji  （n + ji → OK、j は子音なので区別可能）
「かんい」 → kanni  （n + i だと「かに」と区別不能！）
「かんな」 → kanna  （n + na だと「かな」と区別不能！）
```

### ルール

| 次の文字 | 必要なパターン |
|----------|----------------|
| 子音（k, s, t...） | `n` でOK |
| 母音（a, i, u, e, o） | `nn` または `xn` が必要 |
| y行（ya, yu, yo） | `nn` または `xn` が必要 |
| な行（na, ni...） | `nn` または `xn` が必要 |

### 実装

```typescript
function needsDoubleN(text: string, index: number): boolean {
  const nextChar = text[index + 1];
  if (!nextChar) return false;

  // 次が母音、y行、な行の場合は true
  const requiresDoubleN = /^[あいうえおやゆよなにぬねの]/.test(nextChar);
  return requiresDoubleN;
}

// マッチング時
if (currentChar === 'ん') {
  const requiresDoubleN = needsDoubleN(hiragana, hiraganaIndex);

  let nPatterns = ['n', 'nn', 'xn'];

  if (requiresDoubleN) {
    // 次が母音等 → 'n'単独は使えない
    nPatterns = ['nn', 'xn'];

    // ただし、'n' + 次の文字のローマ字が続く場合はOK
    // 例: 「かんい」→ 「kann」まで入力した時点で'n'を確定
  }

  // パターンマッチング...
}
```

## 表示用ターゲット文字列の生成

### 動的なターゲット表示

ユーザーが`s`を打った時点で、ターゲット表示を動的に更新します：

```text
入力前: 「しんぶん」→ sinbun（または shimbun, etc.）
「s」入力後: → s + inbun（siで始まる系統に絞られた）
「sh」入力後: → sh + imbun（shiで始まる系統に絞られた）
```

### 実装

```typescript
// ターゲット文字列を動的に生成
const confirmedInput = result.confirmedInput;
const remainingHiragana = hiragana.slice(result.confirmedChars);
const remainingRomaji = getFirstRomajiPattern(remainingHiragana);

// 表示: 確定部分 + 残りのローマ字
const targetText = confirmedInput + remainingRomaji;
```

### getFirstRomajiPattern関数

```typescript
export function getFirstRomajiPattern(hiragana: string): string {
  let result = '';
  let i = 0;

  while (i < hiragana.length) {
    const currentChar = hiragana[i];

    // 促音の処理
    if (currentChar === 'っ') {
      const nextIndex = i + 1;
      if (nextIndex < hiragana.length) {
        // 次の文字の子音を取得
        const nextPatterns = HIRAGANA_TO_ROMAJI[hiragana[nextIndex]];
        if (nextPatterns) {
          const consonant = nextPatterns[0][0];
          if ('kstcnhfmyrwgzdbpj'.includes(consonant)) {
            result += consonant;  // 子音を重ねる
          } else {
            result += 'xtu';
          }
        }
      }
      i++;
      continue;
    }

    // 拗音を優先チェック
    const twoChar = hiragana.slice(i, i + 2);
    let patterns = HIRAGANA_TO_ROMAJI[twoChar];
    let charLength = 2;

    if (!patterns) {
      patterns = HIRAGANA_TO_ROMAJI[currentChar];
      charLength = 1;
    }

    if (patterns) {
      result += patterns[0];  // 最初のパターンを使用
      i += charLength;
    } else {
      result += currentChar;
      i++;
    }
  }

  return result;
}
```

## React Hookとの統合

### useTypingGameでの使用

```typescript
const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  const newInput = e.target.value;

  // 日本語テキストの場合はローマ字マッチング
  const hiraganaText = currentSentence.hiragana || currentSentence.text;
  const result = matchPartialRomaji(hiraganaText, newInput);

  if (!result.isValid) {
    // 間違い → 効果音 + エラー表示
    playErrorSound();
    setErrors(prev => prev + 1);
    return;
  }

  // 正しい入力
  setInput(newInput);

  if (result.isComplete) {
    // 文が完了 → 次の文へ
    onComplete();
  }
};
```

### 文字表示のカラーリング

```typescript
const getCharacterStatus = (index: number): 'correct' | 'current' | 'pending' => {
  const confirmedLength = matchResult.confirmedInput.length;

  if (index < confirmedLength) {
    return 'correct';  // 緑色
  } else if (index === confirmedLength) {
    return 'current';  // ハイライト
  } else {
    return 'pending';  // グレー
  }
};
```

## 対戦モードへの対応

バトルモードでも同じローマ字変換ロジックを使用：

```typescript
// TypingBattle.tsx
import { matchPartialRomaji, getFirstRomajiPattern } from '@/lib/romaji-converter';

// 入力処理
const handleKeyDown = (e: KeyboardEvent) => {
  const newInput = input + e.key;
  const result = matchPartialRomaji(targetHiragana, newInput);

  if (result.isValid) {
    setInput(newInput);
    // サーバーに進捗を送信
    sendProgress(result.confirmedChars, targetHiragana.length);
  }
};
```

## パフォーマンス考慮

### 変換テーブルのサイズ

150パターン以上のテーブルですが、JavaScriptのオブジェクトアクセスはO(1)なので問題ありません。

### 文字列操作の最適化

```typescript
// 悪い例: 毎回スライス
for (let i = 0; i < input.length; i++) {
  const remaining = input.slice(i);  // 毎回O(n)
}

// 良い例: インデックスで管理
let inputIndex = 0;
while (inputIndex < input.length) {
  // input[inputIndex] で参照
  const remaining = input.slice(inputIndex);  // 必要な時だけ
}
```

## まとめ

| 問題 | 解決策 |
|------|--------|
| 複数ローマ字パターン | 配列で複数パターンを定義 |
| 部分入力の判定 | `startsWith`で前方一致チェック |
| 促音（っ） | 次の文字の子音を取得して重ねる |
| 「ん」の文脈依存 | 次の文字をチェックして条件分岐 |
| 拗音（2文字） | 2文字パターンを優先してマッチング |

この実装により、**どんな入力方法のユーザーでも快適にプレイ**できるタイピングゲームが実現できます。

## 遊んでみる

実際にタイピングゲームを遊んでみたい方は、こちらからどうぞ：

- [タイピング練習](https://adalabtech.com/games/typing)
- [タイピングバトル](https://adalabtech.com/games/typing/battle)

## ソースコード

この記事で紹介したコードの完全版はGitHubで公開しています：

- [romaji-converter.ts（ローマ字変換）](https://github.com/adabana-saki/ADALab/blob/main/lib/romaji-converter.ts)
- [useTypingGame.ts（ゲームHook）](https://github.com/adabana-saki/ADALab/blob/main/hooks/useTypingGame.ts)
- [TypingBattle.tsx（対戦コンポーネント）](https://github.com/adabana-saki/ADALab/blob/main/components/games/TypingBattle.tsx)

## このシリーズの他の記事

このサイトでは、他にもオンライン対戦ゲームの実装記事を公開しています：

- [同一フィールドで戦うスネークバトルを実装してみた](/blog/snake-battle-implementation) - Durable Objectsでサーバー側ゲームロジック
- [2048オンライン対戦で「公平」を実現する方法：シード乱数の魔法](/blog/2048-battle-seeded-random) - シード乱数で両プレイヤーに同じタイル配置を保証
- [テトリスは運ゲーじゃない！7-bagアルゴリズムとマルチプレイ同期の仕組み](/blog/tetris-7bag-algorithm-and-random-sync) - 7-bagとシード乱数の解説

## 参考リンク

- [ローマ字入力 - Wikipedia](https://ja.wikipedia.org/wiki/%E3%83%AD%E3%83%BC%E3%83%9E%E5%AD%97%E5%85%A5%E5%8A%9B)
- [JIS X 4063 - 日本語入力のためのローマ字表記法](https://ja.wikipedia.org/wiki/JIS_X_4063)
- [ヘボン式ローマ字](https://ja.wikipedia.org/wiki/%E3%83%98%E3%83%9C%E3%83%B3%E5%BC%8F%E3%83%AD%E3%83%BC%E3%83%9E%E5%AD%97)
