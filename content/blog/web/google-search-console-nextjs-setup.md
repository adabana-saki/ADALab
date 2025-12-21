---
title: "Next.jsサイトをGoogle Search Consoleに登録する完全ガイド【2025年版】"
date: "2025-12-20T14:00:00"
description: "Next.jsで作成したサイトをGoogle Search Consoleに正しく登録する方法を解説。サイトマップ送信、インデックス確認、検索パフォーマンス分析まで。"
tags: ["Google Search Console", "SEO", "Next.js", "サイトマップ", "インデックス"]
category: "web"
draft: false
---

# Next.jsサイトをGoogle Search Consoleに登録する完全ガイド【2025年版】

サイトを作ったら、次は**Google Search Console（GSC）に登録**しましょう。これをやらないと、Googleに自分のサイトを正しく認識してもらえません。

この記事では、Next.jsサイトをSearch Consoleに登録する手順と、その後にやるべきことを解説します。

## Search Consoleとは？

Google Search Consoleは、Googleが無料で提供するウェブマスターツール。以下のことができます：

- **インデックス状況の確認** - Googleに認識されているページ数
- **検索パフォーマンス分析** - どのキーワードで流入しているか
- **クロールエラーの検出** - 404エラーなどの問題発見
- **サイトマップの送信** - Googleにページ構造を伝える
- **モバイル対応チェック** - スマホ表示の問題検出

SEO改善のPDCAを回すには**必須のツール**です。

---

## Step 1: Search Consoleにサイトを追加

### 1-1. Search Consoleにアクセス

[Google Search Console](https://search.google.com/search-console) にGoogleアカウントでログイン。

### 1-2. プロパティを追加

左上の「プロパティを追加」をクリック。

2つの方法があります：

| 方法 | 説明 | おすすめ度 |
|------|------|-----------|
| **ドメイン** | サブドメイン含め全体を管理 | 独自ドメインなら推奨 |
| **URLプレフィックス** | 特定のURLのみ管理 | pages.devなどはこちら |

独自ドメインなら「ドメイン」、`*.pages.dev`などの共有ドメインなら「URLプレフィックス」を選択。

---

## Step 2: 所有権の確認

Googleに「このサイトは自分のものです」と証明する必要があります。

### 方法1: HTMLファイルをアップロード（推奨）

1. Search Consoleから確認用HTMLファイルをダウンロード
2. Next.jsの`public`フォルダに配置：

```
public/
├── googleXXXXXXXXXXXXXXXX.html  ← ここに配置
├── robots.txt
└── favicon.ico
```

3. デプロイ後、Search Consoleで「確認」をクリック

### 方法2: メタタグを追加

`app/layout.tsx`にメタタグを追加：

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  verification: {
    google: 'your-verification-code-here',
  },
};
```

これで`<meta name="google-site-verification" content="...">`が自動生成されます。

### 方法3: DNSレコード（ドメイン認証）

独自ドメインの場合、DNSにTXTレコードを追加：

1. Search Consoleで表示されるTXTレコードをコピー
2. ドメインレジストラ（Cloudflareなど）のDNS設定に追加
3. 反映まで最大48時間待つ

---

## Step 3: サイトマップを送信

所有権確認後、サイトマップを送信します。

### 3-1. サイトマップURLを確認

Next.jsで`app/sitemap.ts`を作成していれば、自動で`/sitemap.xml`が生成されます。

ブラウザで確認：
```
https://your-site.com/sitemap.xml
```

### 3-2. Search Consoleで送信

1. 左メニュー「サイトマップ」をクリック
2. 「新しいサイトマップの追加」にURLを入力
3. 「送信」をクリック

ステータスが「成功しました」になればOK。

### うまくいかない場合

「取得できませんでした」と表示される場合：

1. **robots.txtを確認** - サイトマップがブロックされていないか
2. **XMLの形式を確認** - 正しいXML形式か
3. **待つ** - 最大72時間かかることも
4. **ドメインを見直す** - `pages.dev`など共有ドメインは問題が起きやすい

---

## Step 4: インデックス状況を確認

### 4-1. URL検査ツール

特定のページがインデックスされているか確認：

1. 上部の検索バーにURLを入力
2. 「インデックス登録をリクエスト」でクロールを促進

### 4-2. カバレッジレポート

左メニュー「ページ」で全体のインデックス状況を確認：

- **有効** - 正常にインデックス済み
- **除外** - インデックスされていない（理由を確認）
- **エラー** - 問題あり（修正が必要）

---

## Step 5: 検索パフォーマンスを分析

登録から数日〜数週間後、データが蓄積されます。

### チェックすべき指標

| 指標 | 意味 |
|------|------|
| **クリック数** | 検索結果からの流入数 |
| **表示回数** | 検索結果に表示された回数 |
| **CTR** | クリック率（クリック/表示） |
| **平均掲載順位** | 検索結果での平均順位 |

### 活用方法

1. **表示回数が多いがクリックが少ない** → タイトル/説明文を改善
2. **特定キーワードで上位** → そのトピックの記事を増やす
3. **順位が低い** → コンテンツを充実させる

---

## Next.js特有の注意点

### 動的ルートのインデックス

動的ルート（`/blog/[slug]`など）は`generateStaticParams`で静的生成しないとインデックスされにくい：

```typescript
// app/blog/[slug]/page.tsx
export function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}
```

### クライアントサイドレンダリングの罠

`'use client'`で完全にクライアント側でレンダリングするページは、Googlebotがコンテンツを取得できない可能性：

```typescript
// 悪い例：'use client'でAPIからデータ取得
'use client';
useEffect(() => {
  fetch('/api/data').then(...)  // Googlebotは待ってくれない
}, []);

// 良い例：サーバーコンポーネントでデータ取得
export default async function Page() {
  const data = await getData();  // ビルド時にデータ取得
  return <div>{data}</div>;
}
```

### メタデータの動的生成

`generateMetadata`を使って動的にメタデータを生成：

```typescript
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  return {
    title: post.title,
    description: post.description,
  };
}
```

---

## トラブルシューティング

### 「サイトマップを読み取れませんでした」

1. XMLの形式が正しいか確認（[XML Validator](https://www.xmlvalidation.com/)）
2. robots.txtでブロックしていないか確認
3. HTTPステータスが200か確認（`curl -I your-url`）

### インデックスされない

1. `noindex`タグがないか確認
2. robots.txtで`Disallow`していないか確認
3. URL検査で手動リクエスト
4. 内部リンクが少なすぎないか確認

### クロール頻度が低い

1. サイトマップを最新に保つ
2. 新しいコンテンツを定期的に追加
3. 他サイトからの被リンクを獲得

---

## まとめ

Search Consoleへの登録は、SEOの**スタートライン**です。

1. **プロパティを追加**して所有権を確認
2. **サイトマップを送信**してGoogleに構造を伝える
3. **定期的にチェック**して問題を早期発見
4. **パフォーマンスデータ**を改善に活かす

これを習慣にすれば、検索順位は着実に上がっていきます。

---

質問があれば[X（@ADA_Lab_tech）](https://x.com/ADA_Lab_tech)までどうぞ！
