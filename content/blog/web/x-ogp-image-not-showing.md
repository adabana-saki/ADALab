---
title: "X（Twitter）でOGP画像が表示されない・更新されない時の対処法"
date: "2025-11-28"
description: "XでリンクをシェアしてもOGP画像が表示されない、または古い画像のまま更新されない問題の原因と解決方法を解説します。"
tags: ["OGP", "X", "トラブルシューティング", "Web開発"]
author: "Adabana Saki"
---

# X（Twitter）でOGP画像が表示されない時の対処法

Webサイトのリンクをシェアした時、OGP画像が表示されない・古い画像のまま更新されないという問題に遭遇したことはありませんか？

この記事では、その原因と解決方法を解説します。

## OGPとは

OGP（Open Graph Protocol）は、SNSでリンクをシェアした時に表示されるタイトル、説明文、画像を指定するための仕様です。

```html
<meta property="og:title" content="ページタイトル" />
<meta property="og:description" content="ページの説明" />
<meta property="og:image" content="https://example.com/image.png" />
```

## よくある問題と原因

### 1. 画像が全く表示されない

**原因:**
- `og:image`タグが設定されていない
- 画像URLが相対パスになっている（絶対URLが必要）
- 画像サイズが小さすぎる（推奨: 1200x630px以上）
- HTTPSでない（XはHTTPS必須）
- 画像ファイルが存在しない・アクセスできない

**解決方法:**

```html
<!-- NG: 相対パス -->
<meta property="og:image" content="/images/ogp.png" />

<!-- OK: 絶対URL -->
<meta property="og:image" content="https://example.com/images/ogp.png" />
```

### 2. 画像を更新しても古いままになる

**原因:**
Xは一度取得したOGP情報を強力にキャッシュします。キャッシュ期間は最大7日間と言われています。

**解決方法:**

#### 方法1: Card Validatorでキャッシュをクリア

1. [Twitter Card Validator](https://cards-dev.twitter.com/validator) にアクセス
2. URLを入力して「Preview card」をクリック
3. 新しい画像が取得される

※ 2023年以降、Card Validatorのプレビュー機能は制限されていますが、キャッシュクリアの効果はあるようです。

#### 方法2: 画像URLにクエリパラメータを追加

```html
<!-- バージョン番号を追加 -->
<meta property="og:image" content="https://example.com/ogp.png?v=2" />

<!-- タイムスタンプを追加 -->
<meta property="og:image" content="https://example.com/ogp.png?t=20251128" />
```

これにより、Xは新しいURLとして認識し、キャッシュを使わず画像を再取得します。

#### 方法3: 画像ファイル名を変更

```html
<!-- 変更前 -->
<meta property="og:image" content="https://example.com/ogp.png" />

<!-- 変更後 -->
<meta property="og:image" content="https://example.com/ogp-v2.png" />
```

### 3. 画像が切れる・比率がおかしい

**原因:**
X推奨のアスペクト比（1.91:1）に合っていない画像を使用している。

**解決方法:**

| プラットフォーム | 推奨サイズ | アスペクト比 |
|------------------|-----------|--------------|
| X（Twitter） | 1200 x 628 px | 1.91:1 |
| Facebook | 1200 x 630 px | 1.91:1 |
| LINE | 1200 x 630 px | 1.91:1 |

```html
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```

### 4. X専用のタグを設定していない

Xには独自のメタタグ（Twitter Cards）があります。

```html
<!-- Twitter Cards用タグ -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@your_account" />
<meta name="twitter:title" content="タイトル" />
<meta name="twitter:description" content="説明文" />
<meta name="twitter:image" content="https://example.com/image.png" />
```

`twitter:card`の種類:
- `summary`: 小さい画像付きカード
- `summary_large_image`: 大きい画像付きカード（推奨）
- `player`: 動画/音声プレイヤー
- `app`: アプリダウンロード用

## Next.jsでの設定例

Next.js 13以降（App Router）での設定例:

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  openGraph: {
    title: 'サイトタイトル',
    description: '説明文',
    url: 'https://example.com',
    images: [
      {
        url: 'https://example.com/og-image.png',
        width: 1200,
        height: 630,
        alt: '画像の説明',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'サイトタイトル',
    description: '説明文',
    images: ['https://example.com/twitter-image.png'],
  },
};
```

または、`opengraph-image.png`と`twitter-image.png`を`app`ディレクトリに配置すると自動的に認識されます。

## デバッグツール

OGP設定が正しいか確認できるツール:

- **[Twitter Card Validator](https://cards-dev.twitter.com/validator)** - X用
- **[Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)** - Facebook用
- **[OGP確認ツール](https://ogp.me/)** - 汎用

## チェックリスト

- [ ] `og:image`に絶対URL（https://〜）を指定している
- [ ] 画像サイズは1200x630px以上
- [ ] 画像はHTTPSでアクセス可能
- [ ] `twitter:card`を`summary_large_image`に設定
- [ ] 画像ファイルが実際に存在する
- [ ] キャッシュクリアを試した

## まとめ

OGP画像が表示されない問題のほとんどは:

1. **URLが相対パス** → 絶対URLに修正
2. **キャッシュが残っている** → クエリパラメータを追加
3. **サイズ・比率が不適切** → 1200x630pxで作成

これらを確認すれば解決できます。

特にキャッシュ問題は見落としがちなので、画像を更新した際は必ずクエリパラメータを追加するか、Card Validatorでキャッシュをクリアしましょう。
