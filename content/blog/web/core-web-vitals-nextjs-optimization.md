---
title: "Core Web Vitalsを劇的改善！Next.jsパフォーマンス最適化テクニック"
date: "2025-12-21"
description: "GoogleのCore Web Vitals（LCP・FID・CLS）をNext.jsで改善する具体的な方法を解説。画像最適化、フォント読み込み、遅延ロードなど実践的なテクニックを紹介。"
tags: ["Core Web Vitals", "パフォーマンス", "Next.js", "LCP", "CLS", "SEO"]
category: "web"
draft: false
---

# Core Web Vitalsを劇的改善！Next.jsパフォーマンス最適化テクニック

「PageSpeed Insightsのスコアが真っ赤…」

そんな悩みを抱えていませんか？2021年以降、GoogleはCore Web Vitalsをランキング要因に含めています。つまり、**サイトが遅いと検索順位が下がる可能性がある**ということ。

この記事では、Next.jsでCore Web Vitalsを改善する**具体的なテクニック**を紹介します。

---

## Core Web Vitalsとは？

Googleが定義する「ユーザー体験の品質指標」です。

| 指標 | 意味 | 目標値 |
|------|------|--------|
| **LCP** (Largest Contentful Paint) | 最大コンテンツの表示時間 | 2.5秒以下 |
| **INP** (Interaction to Next Paint) | 応答性 | 200ms以下 |
| **CLS** (Cumulative Layout Shift) | レイアウトのずれ | 0.1以下 |

※FID（First Input Delay）は2024年3月にINPに置き換わりました。

---

## 1. LCP（最大コンテンツ表示）の改善

LCPは「ページ内で一番大きな要素が表示されるまでの時間」。多くの場合、ヒーロー画像がこれに該当します。

### 1-1. next/imageを正しく使う

```tsx
import Image from 'next/image';

// ❌ 悪い例
<img src="/hero.jpg" alt="Hero" />

// ✅ 良い例
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={630}
  priority  // LCPに影響する画像には必須
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

**ポイント：**
- `priority`属性で優先読み込み
- `placeholder="blur"`で表示までの体験改善
- サイズを明示してレイアウトシフト防止

### 1-2. 画像フォーマットの最適化

```javascript
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};
```

AVIFとWebPは従来のJPEG/PNGより**30-50%小さい**。Next.jsは自動で最適なフォーマットを配信します。

### 1-3. 外部画像の最適化

```javascript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.example.com',
      },
    ],
  },
};
```

### 1-4. サーバーレスポンスの高速化

```typescript
// 静的生成を活用
export const dynamic = 'force-static';
export const revalidate = 3600; // 1時間キャッシュ
```

---

## 2. INP（応答性）の改善

INPは「ユーザー操作から次の描画までの時間」。JavaScriptの実行が重いと悪化します。

### 2-1. 重いコンポーネントの遅延読み込み

```typescript
import dynamic from 'next/dynamic';

// ❌ 普通にimport
import HeavyChart from '@/components/HeavyChart';

// ✅ 動的インポート
const HeavyChart = dynamic(
  () => import('@/components/HeavyChart'),
  {
    loading: () => <div className="skeleton h-64" />,
    ssr: false,  // クライアントのみで読み込む
  }
);
```

### 2-2. イベントハンドラの最適化

```typescript
// ❌ 毎回新しい関数を作成
<button onClick={() => handleClick(item)}>
  Click
</button>

// ✅ useCallbackでメモ化
const handleItemClick = useCallback((item) => {
  // 処理
}, []);

<button onClick={handleItemClick}>
  Click
</button>
```

### 2-3. スクロールイベントのデバウンス

```typescript
import { useDebouncedCallback } from 'use-debounce';

const handleScroll = useDebouncedCallback(() => {
  // スクロール処理
}, 100);

useEffect(() => {
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, [handleScroll]);
```

### 2-4. バンドルサイズの削減

```bash
# バンドル分析
npm install @next/bundle-analyzer

# next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
module.exports = withBundleAnalyzer({});

# 分析実行
ANALYZE=true npm run build
```

大きなライブラリがあれば、軽量な代替を検討：

| 重いライブラリ | 軽量な代替 |
|--------------|----------|
| moment.js (300KB) | date-fns (75KB) / dayjs (6KB) |
| lodash (70KB) | 必要な関数だけimport |
| chart.js | recharts / lightweight-charts |

---

## 3. CLS（レイアウトシフト）の改善

CLSは「読み込み中にレイアウトがずれる量」。画像やフォントが遅れて読み込まれると発生。

### 3-1. 画像のサイズを明示

```tsx
// ❌ サイズ未指定
<img src="/photo.jpg" alt="Photo" />

// ✅ サイズ指定
<Image
  src="/photo.jpg"
  alt="Photo"
  width={800}
  height={600}
/>

// アスペクト比で指定
<div className="relative aspect-video">
  <Image src="/video-thumb.jpg" alt="Video" fill />
</div>
```

### 3-2. フォントの最適化

```typescript
// app/layout.tsx
import { Noto_Sans_JP } from 'next/font/google';

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',  // FOUTを許容してCLSを防ぐ
  preload: true,
});

export default function RootLayout({ children }) {
  return (
    <html className={notoSansJP.className}>
      {children}
    </html>
  );
}
```

`display: 'swap'`で、フォント読み込み中はシステムフォントを表示。レイアウトシフトを防ぎます。

### 3-3. 動的コンテンツのスペース確保

```tsx
// ❌ 読み込み後にスペースが変わる
{isLoading ? null : <AdBanner />}

// ✅ スケルトンでスペース確保
{isLoading ? (
  <div className="h-[250px] bg-muted animate-pulse" />
) : (
  <AdBanner />
)}
```

### 3-4. iframeのサイズ指定

```tsx
// YouTube埋め込みなど
<div className="relative aspect-video">
  <iframe
    src="https://www.youtube.com/embed/xxx"
    className="absolute inset-0 w-full h-full"
    loading="lazy"
  />
</div>
```

---

## 4. その他の最適化

### 4-1. プリロードの活用

```tsx
// app/layout.tsx
export const metadata = {
  other: {
    'link': [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'dns-prefetch', href: 'https://analytics.google.com' },
    ],
  },
};
```

### 4-2. 不要なJavaScriptの削除

```javascript
// next.config.js
module.exports = {
  reactStrictMode: true,
  swcMinify: true,  // SWCで高速ミニファイ
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};
```

### 4-3. スクリプトの遅延読み込み

```tsx
import Script from 'next/script';

// ❌ ブロッキング
<script src="https://analytics.com/script.js" />

// ✅ 遅延読み込み
<Script
  src="https://analytics.com/script.js"
  strategy="lazyOnload"
/>
```

| strategy | タイミング |
|----------|-----------|
| `beforeInteractive` | ハイドレーション前 |
| `afterInteractive` | ハイドレーション後（デフォルト） |
| `lazyOnload` | ページ読み込み完了後 |

---

## 5. 測定方法

### 5-1. PageSpeed Insights

[PageSpeed Insights](https://pagespeed.web.dev/) で実際のユーザーデータを確認。

### 5-2. Chrome DevTools

1. F12でDevToolsを開く
2. Lighthouseタブ
3. 「Analyze page load」をクリック

### 5-3. Web Vitals Extension

[Web Vitals Chrome拡張](https://chrome.google.com/webstore/detail/web-vitals/ahfhijdlegdabablpippeagghigmibma)でリアルタイム測定。

### 5-4. Next.jsのビルトイン分析

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

---

## 改善チェックリスト

### LCP
- [ ] ヒーロー画像に`priority`を付けた
- [ ] next/imageを使っている
- [ ] 画像フォーマットをAVIF/WebPに設定
- [ ] 静的生成を活用している

### INP
- [ ] 重いコンポーネントを遅延読み込み
- [ ] バンドルサイズを確認
- [ ] 不要なライブラリを削除

### CLS
- [ ] 全画像にサイズを指定
- [ ] フォントに`display: swap`を設定
- [ ] 動的コンテンツにスケルトンを使用

---

## まとめ

Core Web Vitalsの改善は、一度やれば継続的に効果を発揮します。

重要なポイント：
1. **画像最適化が最優先** - next/imageを正しく使う
2. **フォントを最適化** - next/fontでCLS防止
3. **重いコードは遅延読み込み** - dynamic importを活用
4. **定期的に測定** - PageSpeed Insightsで確認

これらを実践すれば、スコアは確実に改善します。焦らず一つずつ対応していきましょう。

---

質問があれば[X（@ADA_Lab_tech）](https://x.com/ADA_Lab_tech)までお気軽にどうぞ！
