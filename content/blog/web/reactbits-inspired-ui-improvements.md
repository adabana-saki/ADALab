---
title: "ReactBits.devから学ぶ：ADALabサイトに27個のアニメーションコンポーネントを追加してUI大改善"
date: "2025-12-14"
publishDate: "2025-12-14"
description: "ReactBits.devから学んだベストプラクティスを活かして、8つの新しいアニメーションコンポーネントを追加。コードレビューでの指摘対応も含めた、実践的なUI改善の全記録。"
tags: ["React", "UI/UX", "Framer Motion", "TypeScript", "Next.js"]
author: "ADA Lab"
---

## はじめに

ADALabのWebサイトをさらに魅力的にするため、[ReactBits.dev](https://www.reactbits.dev/)という素晴らしいコンポーネントライブラリから学び、UI改善を行いました。この記事では、追加した8つの新しいコンポーネントと、コードレビューでの学びを共有します。

## ReactBits.devとは？

ReactBits.devは、**110以上の高品質でアニメーション化されたReactコンポーネント**を提供するオープンソースライブラリです。

### ReactBitsの特徴

- ✅ **豊富なバリエーション**：110+のアニメーションコンポーネント
- ✅ **高度なカスタマイズ性**：propsを通じた柔軟な設定
- ✅ **TypeScript対応**：型安全性の確保
- ✅ **最小限の依存関係**：シンプルな実装
- ✅ **明確な分類**：テキスト、ボタン、カード、背景の4カテゴリ

## 追加した8つの新しいコンポーネント

### 1. テキストアニメーション（4個）

#### ShimmerText - 光沢エフェクト

光が流れるようなシマーエフェクトを持つテキストコンポーネント。

```typescript
interface ShimmerTextProps {
  children: React.ReactNode;
  className?: string;
  shimmerColor?: string;      // シマーの色
  duration?: number;           // アニメーション時間
  spread?: number;             // 光の広がり
}
```

**使用例**：
```tsx
<ShimmerText
  shimmerColor="rgba(0, 245, 255, 0.6)"
  duration={2}
>
  重要なお知らせ
</ShimmerText>
```

#### GradientText - グラデーションアニメーション

カラフルなグラデーションが動くテキストエフェクト。

```typescript
interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];           // グラデーションカラー配列
  animationDuration?: number;  // アニメーション時間
  animate?: boolean;           // アニメーションのON/OFF
}
```

**実装例（Heroセクション）**：
```tsx
<GradientText
  colors={['#00f5ff', '#ffffff', '#ff00ff', '#00f5ff']}
  animationDuration={4}
>
  Build. Ship. Scale.
</GradientText>
```

#### RevealText - リビールエフェクト

文字が順番に現れるアニメーション。

```typescript
interface RevealTextProps {
  children: string;
  className?: string;
  delay?: number;              // 開始遅延
  duration?: number;           // 各文字の表示時間
  revealDirection?: 'up' | 'down' | 'left' | 'right';
  stagger?: number;            // 文字間の遅延
}
```

#### TextScramble - スクランブルエフェクト

ランダムな文字からテキストが形成されるエフェクト。

```typescript
interface TextScrambleProps {
  children: string;
  className?: string;
  scrambleSpeed?: number;      // スクランブル速度
  characters?: string;         // 使用する文字セット
  startDelay?: number;         // 開始遅延
}
```

### 2. ボタンエフェクト（1個）

#### ShinyButton - 光沢ボタン

ホバー時に光が流れるボタンエフェクト。

```typescript
interface ShinyButtonProps {
  children: React.ReactNode;
  className?: string;
  shineColor?: string;         // 光の色
  shineDuration?: number;      // 光の流れる速度
  shineWidth?: number;         // 光の幅
  onClick?: () => void;
}
```

### 3. カードエフェクト（1個）

#### SpotlightCard - スポットライトエフェクト

マウスに追従するスポットライトエフェクト付きカード。

```typescript
interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;     // スポットライトの色
  spotlightSize?: number;      // スポットライトのサイズ
  borderRadius?: string;       // カードの角丸
}
```

### 4. 背景エフェクト（2個）

#### DotPattern - ドットパターン

カスタマイズ可能なドットパターン背景。

```typescript
interface DotPatternProps {
  className?: string;
  dotSize?: number;            // ドットサイズ
  dotColor?: string;           // ドットの色
  gap?: number;                // ドット間隔
  animate?: boolean;           // アニメーションON/OFF
  fadeEdges?: boolean;         // 端のフェード効果
}
```

**実装例（Heroセクション）**：
```tsx
<DotPattern
  dotSize={1.5}
  gap={25}
  dotColor="#00f5ff"
  fadeEdges={true}
  animate={showParticles}
/>
```

#### WaveBackground - 波背景

波のようなアニメーション背景。

```typescript
interface WaveBackgroundProps {
  className?: string;
  waveColor?: string;          // 波の色
  waveOpacity?: number;        // 波の透明度
  waveCount?: number;          // 波の数
  animationDuration?: number;  // アニメーション時間
}
```

## コードレビューでの学び

GitHub Advanced Securityとcoderabbitaiからのレビューで、重要な問題が見つかりました。

### 1. 未使用インポートの削除

**問題**：
```typescript
import { RevealText } from '../effects/RevealText'; // 未使用
```

**学び**：未使用のインポートはバンドルサイズを増やし、コードを読みにくくします。

### 2. SpotlightCard - Opacity問題

**問題**：
```tsx
<div className="opacity-0 hover:opacity-100 pointer-events-none" />
```

`pointer-events-none`により、hoverが効かない。

**修正**：
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3 }}
/>
```

**学び**：CSSクラスとFramer Motionを組み合わせる際は、競合に注意。

### 3. WaveBackground - 負のOpacity問題

**問題**：
```typescript
opacity: waveOpacity - wave * 0.02  // 負の値になる可能性
```

`waveCount`が大きいと、opacityが負の値になる。

**修正**：
```typescript
opacity: Math.max(0, waveOpacity - wave * 0.02)
```

**学び**：計算結果が想定外の値にならないよう、バリデーションを追加。

### 4. WaveBackground - Transform競合

**問題**：
```tsx
animate={{ y: [-20, 20, -20] }}
style={{ transform: `scale(${1 + wave * 0.1})` }}
```

インラインtransformがFramer Motionのアニメーションと競合。

**修正**：
```tsx
initial={{ y: 0, scale: 1 + wave * 0.1 }}
animate={{ y: [-20, 20, -20], scale: 1 + wave * 0.1 }}
```

**学び**：Framer Motionを使う場合、すべてのtransformをFramer Motionで管理。

### 5. TextScramble - メモリリーク問題 🔴

**問題**：
```typescript
const startTimeout = setTimeout(() => {
  const intervalId = setInterval(() => { /* ... */ });

  return () => clearInterval(intervalId);  // ❌ 実行されない！
}, startDelay);
```

setTimeoutのコールバック内のreturnは、クリーンアップ関数として機能しない。

**修正**：
```typescript
useEffect(() => {
  let intervalId: NodeJS.Timeout | undefined;

  const startTimeout = setTimeout(() => {
    intervalId = setInterval(() => { /* ... */ });
  }, startDelay);

  return () => {
    clearTimeout(startTimeout);
    if (intervalId) clearInterval(intervalId);
  };
}, [dependencies]);
```

**学び**：
- useEffectのクリーンアップ関数は、useEffect自体のreturnでのみ定義
- タイマーIDをスコープ変数で管理
- メモリリークを防ぐため、すべてのタイマーを確実にクリア

## 改善の成果

### コンポーネント数の増加

```
改善前: 19個
改善後: 27個以上（+42%）
```

### カテゴリ分類

ReactBitsから学び、明確に分類：

- 📝 **テキストアニメーション**：6個
- 🎯 **ボタンエフェクト**：2個
- 🃏 **カードエフェクト**：1個
- 🌊 **背景エフェクト**：7個
- ✨ **その他のエフェクト**：11個

### 品質向上

- ✅ すべてのコンポーネントがpropsでカスタマイズ可能
- ✅ TypeScriptによる完全な型定義
- ✅ メモリリークなし
- ✅ パフォーマンス最適化済み

## 実装のベストプラクティス

### 1. Propsによる高度なカスタマイズ

すべてのコンポーネントで、色、速度、サイズなどをカスタマイズ可能に。

```typescript
export function ShimmerText({
  children,
  className = '',
  shimmerColor = 'rgba(0, 245, 255, 0.6)',  // デフォルト値を提供
  duration = 2,
  spread = 100,
}: ShimmerTextProps) {
  // ...
}
```

### 2. TypeScriptでの型安全性

インターフェースを明確に定義。

```typescript
interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  animationDuration?: number;
  animate?: boolean;
}
```

### 3. パフォーマンス最適化

動的インポートで初期ロードを軽量化。

```typescript
const DotPattern = dynamic(
  () => import('@/components/effects/DotPattern'),
  { ssr: false }
);
```

### 4. クリーンアップの徹底

メモリリークを防ぐため、すべてのタイマーをクリア。

```typescript
useEffect(() => {
  const timerId = setTimeout(() => { /* ... */ });
  return () => clearTimeout(timerId);
}, [dependencies]);
```

## 今後の展開

これらのコンポーネントを活用して：

- ✨ ブログ記事タイトルに**TextScramble**
- ✨ プロジェクトカードに**SpotlightCard**
- ✨ CTAボタンに**ShinyButton**
- ✨ セクションタイトルに**GradientText**

など、サイト全体をさらに魅力的にしていきます。

## まとめ

ReactBits.devから学んだベストプラクティスを活かして、ADALabサイトに27個以上の高品質なアニメーションコンポーネントを追加しました。

**重要な学び**：
1. **豊富なバリエーション**：ユーザーに多様な選択肢を提供
2. **高度なカスタマイズ性**：propsでの柔軟な設定
3. **型安全性**：TypeScriptでのバグ防止
4. **メモリ管理**：クリーンアップの徹底
5. **コードレビュー**：自動化ツールでの品質向上

これらの改善により、ADALabサイトはより現代的で魅力的なUIを持つサイトに進化しました。

## 参考リンク

- [ReactBits.dev](https://www.reactbits.dev/)
- [GitHub - DavidHDev/react-bits](https://github.com/DavidHDev/react-bits)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [ADALab GitHub](https://github.com/adabana-saki/ADALab)

---

この記事が、あなたのプロジェクトのUI改善の参考になれば幸いです！
