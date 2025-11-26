# ADA Lab 公式サイト

[![Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-orange)](https://adalab.pages.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)

ADA Labの公式Webサイトのソースコードです。

🌐 **サイトURL**: https://adalab.pages.dev/

## クイックスタート

```bash
# リポジトリをクローン
git clone https://github.com/adabana-saki/ADALab.git
cd ADALab

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

http://localhost:3000 でサイトが表示されます。

## ブログ記事の追加

`content/blog/` にMarkdownファイルを追加するだけで記事が公開されます。

### 1. 新しい記事を作成

```bash
# テンプレートをコピー
cp content/blog/_template.md content/blog/my-new-post.md
```

### 2. 記事を編集

```markdown
---
title: "記事タイトル"
date: "2024-11-26"
description: "記事の説明（一覧ページに表示）"
tags: ["タグ1", "タグ2"]
author: "著者名"
---

# 本文

ここにMarkdownで記事を書きます。
```

### 3. 確認

- 一覧ページ: http://localhost:3000/blog
- 記事ページ: http://localhost:3000/blog/my-new-post

## プロジェクト構成

```
├── app/                    # Next.js App Router
│   ├── blog/              # ブログページ
│   ├── products/          # プロダクト詳細ページ
│   └── ...
├── components/            # Reactコンポーネント
│   ├── sections/          # ページセクション
│   ├── ui/                # UIコンポーネント
│   └── blog/              # ブログ関連
├── content/
│   └── blog/              # ブログ記事（Markdown）
├── lib/                   # ユーティリティ関数
└── public/                # 静的ファイル
```

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 15 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| アニメーション | Framer Motion |
| ホスティング | Cloudflare Pages |

## スクリプト

```bash
npm run dev      # 開発サーバー起動
npm run build    # プロダクションビルド
npm run lint     # ESLintでコードチェック
npm run format   # Prettierでフォーマット
```

## デプロイ

mainブランチにマージすると、Cloudflare Pagesが自動でデプロイします。

## お問い合わせ

- **Email**: info.adalabtech@gmail.com
- **X**: [@ADA_Lab_tech](https://x.com/ADA_Lab_tech)
- **Discord**: [ADA Lab](https://discord.gg/7Egm8uJPDs)

## ライセンス

© 2025 ADA Lab. All rights reserved.
