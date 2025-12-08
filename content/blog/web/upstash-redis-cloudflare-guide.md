---
title: "Upstash Redis × Cloudflare Pages で作る動的機能 - 静的サイトにいいね・ビュー機能を追加"
date: "2025-12-04"
publishDate: "2025-12-04"
description: "静的サイト（SSG）でも動的な機能を実装する方法を解説。Upstash RedisとCloudflare Functionsを使って、いいねボタンやビューカウンターを作ります。"
tags: ["Upstash", "Redis", "Cloudflare", "Next.js", "サーバーレス"]
author: "Adabana Saki"
category: "Web開発"
---

# Upstash Redis × Cloudflare Pages で作る動的機能

静的サイト（SSG）を使っていると、「いいねボタン」や「ビューカウンター」のような動的な機能は諦めがち。

でも、**Upstash Redis** と **Cloudflare Functions** を組み合わせれば、バックエンドサーバーなしで実現できます。

この記事では、実際にこのブログに実装した方法を解説します。

## なぜこの構成？

### 静的サイトの課題

Next.jsの`output: 'export'`やCloudflare Pagesを使った静的サイトには、いくつかの制約があります。

```
❌ サーバーサイドの処理ができない
❌ APIルートが使えない
❌ データベース接続が直接できない
```

つまり、「いいねを保存する」「ビュー数をカウントする」といった**状態を持つ機能**は、通常の方法では実装できません。

### 解決策：Upstash + Cloudflare Functions

```
【アーキテクチャ】

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Static Site    │────▶│  Cloudflare     │────▶│  Upstash Redis  │
│  (Next.js SSG)  │     │  Functions      │     │  (Serverless)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
      ブラウザ              APIエンドポイント         データ永続化
```

この構成のメリット：

- **サーバー管理不要** - すべてサーバーレス
- **無料枠が充実** - 小規模サイトなら無料で運用可能
- **グローバル配信** - エッジで処理されるので高速
- **簡単デプロイ** - GitHubと連携するだけ

## Upstash Redisのセットアップ

### 1. アカウント作成

[Upstash Console](https://console.upstash.com/)にアクセスしてアカウントを作成します。

GitHubアカウントでのサインアップが簡単です。

### 2. データベース作成

1. 「Create Database」をクリック
2. 名前を入力（例：`my-blog-engagement`）
3. リージョンを選択（日本向けなら`ap-northeast-1`がおすすめ）
4. 「Create」をクリック

### 3. 認証情報を取得

作成後、以下の情報をコピーします：

```
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AYySAAIncDE...
```

この情報は後でCloudflare Pagesの環境変数に設定します。

## Cloudflare Functionsの実装

### ディレクトリ構造

Cloudflare Pagesでは、`functions`フォルダにファイルを置くだけでAPIエンドポイントになります。

```
project/
├── functions/
│   └── api/
│       └── blog/
│           ├── engagement.ts      # /api/blog/engagement
│           └── [slug]/
│               └── engagement.ts  # /api/blog/[slug]/engagement
├── app/
│   └── ...
└── ...
```

### パッケージのインストール

```bash
npm install @upstash/redis
npm install -D @cloudflare/workers-types
```

### 一括取得API（engagement.ts）

ブログ一覧ページで全記事のエンゲージメントを取得するAPIです。

```typescript
// functions/api/blog/engagement.ts
import { Redis } from '@upstash/redis/cloudflare';

interface Env {
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const { slugs } = await request.json() as { slugs: string[] };

  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });

  // パイプラインで効率的に取得
  const pipeline = redis.pipeline();
  for (const slug of slugs) {
    pipeline.get(`views:${slug}`);
    pipeline.get(`likes:${slug}`);
  }

  const results = await pipeline.exec();

  // 結果を整形
  const engagement: Record<string, { views: number; likes: number }> = {};
  for (let i = 0; i < slugs.length; i++) {
    engagement[slugs[i]] = {
      views: (results[i * 2] as number) || 0,
      likes: (results[i * 2 + 1] as number) || 0,
    };
  }

  return new Response(JSON.stringify(engagement), {
    headers: { 'Content-Type': 'application/json' },
  });
};
```

**ポイント**: Redisの`pipeline()`を使うことで、複数のコマンドを1回のリクエストで実行できます。100記事あっても1回のAPI呼び出しで済みます。

### 個別記事API（[slug]/engagement.ts）

記事ページでビューをカウントしたり、いいねをトグルするAPIです。

```typescript
// functions/api/blog/[slug]/engagement.ts
import { Redis } from '@upstash/redis/cloudflare';

interface Env {
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
}

// GET: エンゲージメントデータを取得
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { params, request, env } = context;
  const slug = params.slug as string;
  const url = new URL(request.url);
  const visitorId = url.searchParams.get('visitorId');

  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });

  const pipeline = redis.pipeline();
  pipeline.get(`views:${slug}`);
  pipeline.get(`likes:${slug}`);
  if (visitorId) {
    pipeline.exists(`liked:${slug}:${visitorId}`);
  }

  const results = await pipeline.exec();

  return new Response(JSON.stringify({
    views: (results[0] as number) || 0,
    likes: (results[1] as number) || 0,
    hasLiked: visitorId ? (results[2] as number) === 1 : false,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

// POST: ビューカウントまたはいいねトグル
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { params, request, env } = context;
  const slug = params.slug as string;
  const { action, visitorId } = await request.json() as {
    action: 'view' | 'like';
    visitorId: string;
  };

  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });

  if (action === 'view') {
    await redis.incr(`views:${slug}`);
  }

  if (action === 'like' && visitorId) {
    const userLikedKey = `liked:${slug}:${visitorId}`;
    const hasLiked = await redis.exists(userLikedKey);

    if (hasLiked) {
      // いいね取り消し
      await redis.del(userLikedKey);
      await redis.decr(`likes:${slug}`);
    } else {
      // いいね追加（1年間保持）
      await redis.set(userLikedKey, '1', { ex: 60 * 60 * 24 * 365 });
      await redis.incr(`likes:${slug}`);
    }
  }

  // 更新後のデータを返す
  const [views, likes] = await Promise.all([
    redis.get(`views:${slug}`),
    redis.get(`likes:${slug}`),
  ]);

  return new Response(JSON.stringify({
    views: (views as number) || 0,
    likes: (likes as number) || 0,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
```

## フロントエンドの実装

### カスタムフック

APIを呼び出すカスタムフックを作成します。

```typescript
// hooks/useEngagement.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

// 訪問者IDを生成・取得
function getVisitorId(): string {
  if (typeof window === 'undefined') return '';

  let visitorId = localStorage.getItem('visitorId');
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem('visitorId', visitorId);
  }
  return visitorId;
}

export function useEngagement(slug: string) {
  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 初期データ取得
  useEffect(() => {
    const fetchData = async () => {
      const visitorId = getVisitorId();
      const res = await fetch(
        `/api/blog/${slug}/engagement?visitorId=${visitorId}`
      );
      if (res.ok) {
        const data = await res.json();
        setViews(data.views);
        setLikes(data.likes);
        setHasLiked(data.hasLiked);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [slug]);

  // ビューをカウント（セッション内で1回のみ）
  const trackView = useCallback(async () => {
    const viewedKey = `viewed:${slug}`;
    if (sessionStorage.getItem(viewedKey)) return;

    sessionStorage.setItem(viewedKey, '1');
    const res = await fetch(`/api/blog/${slug}/engagement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'view', visitorId: getVisitorId() }),
    });

    if (res.ok) {
      const data = await res.json();
      setViews(data.views);
    }
  }, [slug]);

  // いいねトグル
  const toggleLike = useCallback(async () => {
    const res = await fetch(`/api/blog/${slug}/engagement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'like', visitorId: getVisitorId() }),
    });

    if (res.ok) {
      const data = await res.json();
      setLikes(data.likes);
      setHasLiked(!hasLiked);
    }
  }, [slug, hasLiked]);

  return { views, likes, hasLiked, isLoading, trackView, toggleLike };
}
```

### いいねボタンコンポーネント

```tsx
// components/blog/LikeButton.tsx
'use client';

import { Heart } from 'lucide-react';

interface LikeButtonProps {
  likes: number;
  hasLiked: boolean;
  onToggle: () => void;
  isLoading?: boolean;
}

export function LikeButton({ likes, hasLiked, onToggle, isLoading }: LikeButtonProps) {
  return (
    <button
      onClick={onToggle}
      disabled={isLoading}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-full border transition-all
        ${hasLiked
          ? 'bg-pink-500/10 border-pink-500/50 text-pink-500'
          : 'bg-gray-100 border-gray-200 text-gray-600 hover:text-pink-500'
        }
      `}
    >
      <Heart
        size={18}
        className={hasLiked ? 'fill-current' : ''}
      />
      <span>{likes}</span>
    </button>
  );
}
```

### 記事ページでの使用

```tsx
// app/blog/[slug]/page.tsx
'use client';

import { useEffect } from 'react';
import { useEngagement } from '@/hooks/useEngagement';
import { LikeButton } from '@/components/blog/LikeButton';

export default function BlogPost({ slug }: { slug: string }) {
  const { views, likes, hasLiked, isLoading, trackView, toggleLike } = useEngagement(slug);

  // ページ読み込み時にビューをカウント
  useEffect(() => {
    trackView();
  }, [trackView]);

  return (
    <article>
      {/* 記事ヘッダー */}
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>{views} views</span>
        <LikeButton
          likes={likes}
          hasLiked={hasLiked}
          onToggle={toggleLike}
          isLoading={isLoading}
        />
      </div>

      {/* 記事本文... */}

      {/* 記事フッター：大きないいねボタン */}
      <div className="text-center py-8">
        <p className="mb-4">この記事が役に立ったら</p>
        <LikeButton
          likes={likes}
          hasLiked={hasLiked}
          onToggle={toggleLike}
          isLoading={isLoading}
        />
      </div>
    </article>
  );
}
```

## Cloudflare Pagesへのデプロイ

### 環境変数の設定

1. Cloudflare Pagesのダッシュボードにアクセス
2. プロジェクト → Settings → Environment variables
3. 以下を追加：

```
UPSTASH_REDIS_REST_URL = https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN = AYySAAIncDE...
```

### TypeScript設定

`functions`フォルダはNext.jsのコンパイルから除外する必要があります。

```json
// tsconfig.json
{
  "exclude": [
    "node_modules",
    "functions"  // 追加
  ]
}
```

Cloudflare Functions用の別のtsconfigを作成：

```json
// functions/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2020"],
    "types": ["@cloudflare/workers-types"],
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["./**/*.ts"]
}
```

### デプロイ

GitHubにプッシュするだけで自動デプロイされます。

```bash
git add .
git commit -m "feat: ✨ Add engagement system with Upstash Redis"
git push
```

## 人気順ソートの実装

取得したエンゲージメントデータを使って、人気順にソートできます。

```typescript
// 人気スコア = ビュー数 + (いいね数 × 3)
const sortByPopularity = (posts: Post[], engagement: Record<string, Engagement>) => {
  return [...posts].sort((a, b) => {
    const aScore = (engagement[a.slug]?.views || 0) + (engagement[a.slug]?.likes || 0) * 3;
    const bScore = (engagement[b.slug]?.views || 0) + (engagement[b.slug]?.likes || 0) * 3;
    return bScore - aScore;
  });
};
```

いいねはビューより価値があるので、3倍の重みをつけています。

## 料金について

### Upstash Redis

- **無料枠**: 10,000コマンド/日
- 小規模ブログなら十分

### Cloudflare Pages

- **無料枠**: 100,000リクエスト/日
- Functions含む

個人ブログなら**完全無料**で運用できます。

## まとめ

Upstash Redis × Cloudflare Functionsの組み合わせで、静的サイトに動的機能を追加できました。

```
✅ サーバー管理不要
✅ 無料で運用可能
✅ 簡単にデプロイ
✅ エッジで高速処理
```

この構成は、いいね機能以外にも応用できます：

- コメント機能
- ブックマーク
- アクセス解析
- リアルタイム通知

ぜひ試してみてください！
