---
title: "【2025年版】Next.js SEO完全ガイド - 検索上位を狙う実践テクニック"
date: "2025-12-20T12:00:00"
description: "Next.js App Routerを使ったSEO対策を徹底解説。メタデータ設定、構造化データ、Core Web Vitals最適化、内部リンク戦略まで、実際のコード例とともに紹介します。"
tags: ["Next.js", "SEO", "React", "構造化データ", "Core Web Vitals", "メタデータ"]
category: "web"
draft: false
---

# 【2025年版】Next.js SEO完全ガイド - 検索上位を狙う実践テクニック

「Next.jsでサイトを作ったけど、全然検索に出てこない…」

そんな悩みを抱えていませんか？Next.jsは優れたフレームワークですが、**SEO対策は自動ではやってくれません**。適切な設定をしないと、せっかくのコンテンツがGoogleに正しく評価されない可能性があります。

この記事では、Next.js App Router（v13以降）を使ったSEO対策を、**実際のコード例とともに徹底解説**します。

## この記事で学べること

- Next.jsのメタデータ設定（Metadata API）
- 構造化データ（JSON-LD）の実装方法
- サイトマップとrobots.txtの設定
- Core Web Vitals最適化テクニック
- 内部リンク戦略
- OGP画像の自動生成

---

## 1. メタデータの設定（Metadata API）

Next.js 13以降では、**Metadata API**を使って簡単にメタデータを設定できます。

### 静的メタデータ

ページごとに固定のメタデータを設定する場合：

```typescript
// app/products/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Products | ADA Lab',
  description: 'ADA Labが開発するプロダクト一覧。Rem botやNaviなど。',
  keywords: ['Discord Bot', 'アプリ開発', 'ADA Lab'],
  alternates: {
    canonical: 'https://adalab.pages.dev/products',
  },
  openGraph: {
    title: 'Products | ADA Lab',
    description: 'ADA Labが開発するプロダクト一覧',
    type: 'website',
    locale: 'ja_JP',
  },
};
```

### 動的メタデータ

ブログ記事など、動的にメタデータを生成する場合：

```typescript
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  return {
    title: `${post.title} | Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      images: [`/og/${slug}/og-image.png`],
    },
  };
}
```

### タイトルテンプレート

ルートレイアウトでタイトルテンプレートを設定すると、各ページで共通のサフィックスが自動付与されます：

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: 'ADA Lab | あなたの"ほしい"を、カタチに',
    template: '%s | ADA Lab',
  },
};
```

これで各ページでは`title: 'Products'`と書くだけで、`Products | ADA Lab`と表示されます。

---

## 2. 構造化データ（JSON-LD）の実装

構造化データを追加すると、Googleのリッチスニペットに表示される可能性が高まります。

### 組織情報スキーマ

```typescript
// components/StructuredData.tsx
import Script from 'next/script';

export function StructuredData() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ADA Lab',
    description: 'シンプルで使いやすいアプリを開発する個人開発チーム',
    url: 'https://adalab.pages.dev',
    logo: 'https://adalab.pages.dev/logo.png',
    sameAs: [
      'https://github.com/adabana-saki',
      'https://x.com/ADA_Lab_tech',
    ],
  };

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(organizationSchema),
      }}
    />
  );
}
```

### FAQ構造化データ

FAQページには専用のスキーマを追加することで、検索結果に質問と回答が表示されます：

```typescript
// components/FAQStructuredData.tsx
interface FAQItem {
  question: string;
  answer: string;
}

export function FAQStructuredData({ faqs }: { faqs: FAQItem[] }) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <Script
      id="faq-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(faqSchema),
      }}
    />
  );
}
```

### 記事スキーマ（Article）

ブログ記事には`Article`スキーマを追加：

```typescript
const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: post.title,
  description: post.description,
  image: `https://adalab.pages.dev/og/${post.slug}/og-image.png`,
  datePublished: post.date,
  dateModified: post.updatedAt || post.date,
  author: {
    '@type': 'Person',
    name: 'Adabana Saki',
  },
  publisher: {
    '@type': 'Organization',
    name: 'ADA Lab',
    logo: {
      '@type': 'ImageObject',
      url: 'https://adalab.pages.dev/logo.png',
    },
  },
};
```

---

## 3. サイトマップとrobots.txt

### 動的サイトマップの生成

Next.js App Routerでは、`sitemap.ts`で動的にサイトマップを生成できます：

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://adalab.pages.dev';
  const posts = getAllPosts();

  // 静的ページ
  const staticPages = [
    { url: baseUrl, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/blog`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/products`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/company`, changeFrequency: 'monthly', priority: 0.7 },
  ];

  // ブログ記事
  const blogPages = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.date,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages];
}
```

### robots.txt

```typescript
// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/'],
    },
    sitemap: 'https://adalab.pages.dev/sitemap.xml',
  };
}
```

---

## 4. Core Web Vitals最適化

GoogleはCore Web Vitalsをランキング要因としています。Next.jsで最適化するポイント：

### 画像最適化

```tsx
import Image from 'next/image';

// 悪い例
<img src="/hero.png" alt="Hero" />

// 良い例
<Image
  src="/hero.png"
  alt="Hero"
  width={1200}
  height={630}
  priority // LCPに影響する画像はpriorityを付ける
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### next.config.jsでの画像設定

```javascript
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    minimumCacheTTL: 60,
  },
};
```

### フォント最適化

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // フォント読み込み中はシステムフォントを表示
});

export default function RootLayout({ children }) {
  return (
    <html lang="ja" className={inter.className}>
      {children}
    </html>
  );
}
```

### コンポーネントの遅延読み込み

```typescript
import dynamic from 'next/dynamic';

// 重いコンポーネントは遅延読み込み
const HeavyComponent = dynamic(
  () => import('@/components/HeavyComponent'),
  {
    loading: () => <div>Loading...</div>,
    ssr: false // 必要に応じてSSRを無効化
  }
);
```

---

## 5. 内部リンク戦略

内部リンクはSEOに非常に重要。以下のポイントを押さえましょう：

### フッターでの網羅的リンク

```typescript
const footerLinks = {
  products: [
    { name: 'すべてのプロダクト', href: '/products' },
    { name: 'Rem bot', href: '/products/rem' },
    { name: 'Navi', href: '/products/navi' },
  ],
  company: [
    { name: '会社情報', href: '/company' },
    { name: 'ブログ', href: '/blog' },
    { name: 'ロードマップ', href: '/roadmap' },
  ],
  support: [
    { name: 'FAQ', href: '/faq' },
    { name: 'プライバシー', href: '/privacy' },
    { name: '利用規約', href: '/terms' },
  ],
};
```

### パンくずリスト

```typescript
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: '/blog' },
    { '@type': 'ListItem', position: 3, name: post.title },
  ],
};
```

### 関連記事の表示

ブログ記事の下に関連記事を表示することで、サイト内回遊を促進：

```tsx
<RelatedPosts currentSlug={slug} tags={post.tags} limit={3} />
```

---

## 6. OGP画像の自動生成

SNSでシェアされたときに表示されるOGP画像を自動生成：

```typescript
// scripts/generate-og-images.mjs
import satori from 'satori';
import sharp from 'sharp';

async function generateOGImage(title, slug) {
  const svg = await satori(
    <div style={{
      width: 1200,
      height: 630,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <h1 style={{ color: 'white', fontSize: 48 }}>{title}</h1>
    </div>,
    { width: 1200, height: 630, fonts: [...] }
  );

  await sharp(Buffer.from(svg))
    .png()
    .toFile(`public/og/${slug}/og-image.png`);
}
```

---

## 7. チェックリスト

実装後は以下を確認：

- [ ] 各ページにユニークなtitle/descriptionが設定されている
- [ ] canonical URLが正しく設定されている
- [ ] 構造化データがGoogle Rich Results Testで検証済み
- [ ] サイトマップがSearch Consoleに登録されている
- [ ] robots.txtでクロールが正しく許可されている
- [ ] Core Web Vitalsが「良好」判定
- [ ] 全ページにalt属性付きの画像がある
- [ ] 内部リンクが適切に配置されている

---

## まとめ

Next.jsでのSEO対策は、一度設定すれば自動で効果を発揮します。重要なのは：

1. **メタデータを正しく設定する**（Metadata API活用）
2. **構造化データでGoogleに情報を伝える**（JSON-LD）
3. **Core Web Vitalsを最適化する**（画像・フォント・遅延読み込み）
4. **内部リンクでサイト構造を明確にする**

これらを実装すれば、検索エンジンからの評価は確実に上がります。焦らず一つずつ対応していきましょう。

---

質問や感想があれば、[X（@ADA_Lab_tech）](https://x.com/ADA_Lab_tech)までお気軽にどうぞ！
