<div align="center">

# ADA Lab

**あなたの"ほしい"を、カタチに。**

[![Live Site](https://img.shields.io/badge/Live-adalabtech.com-00d4aa?style=for-the-badge)](https://adalabtech.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)

<img src="public/opengraph-image.png" alt="ADA Lab" width="600">

</div>

---

## About

ADA Labの公式Webサイトです。シンプルで使いやすいアプリやサービスを開発する個人開発チームのポートフォリオサイトとして機能しています。

### Features

- 高品質なアニメーションコンポーネント（27種類以上）
- 技術ブログ（Markdown対応、予約投稿機能）
- SEO最適化（構造化データ、OGP画像自動生成）
- ダークモード対応
- 多言語対応（日本語/英語）
- ブラウザゲーム

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router, Static Export) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| 3D | React Three Fiber |
| Database | Cloudflare D1, Upstash Redis |
| Hosting | Cloudflare Pages |

## Quick Start

```bash
# Clone
git clone https://github.com/adabana-saki/ADALab.git
cd ADALab

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── blog/              # Blog pages
│   ├── games/             # Browser games
│   └── products/          # Product pages
├── components/            # React components
│   ├── sections/          # Page sections
│   ├── effects/           # Animation effects
│   ├── games/             # Game components
│   └── blog/              # Blog components
├── content/
│   └── blog/              # Blog posts (Markdown)
├── functions/             # Cloudflare Pages Functions
├── lib/                   # Utilities
└── public/                # Static assets
```

## Blog

ブログ記事は `content/blog/` にMarkdownファイルを追加するだけで公開されます。

```markdown
---
title: "記事タイトル"
date: "2025-01-01"
description: "記事の説明"
tags: ["Tag1", "Tag2"]
---

本文をここに記述
```

### Scheduled Publishing

`publishDate` を設定すると予約投稿が可能です。毎朝9時(JST)に自動ビルドが実行されます。

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # ESLint
npm run format   # Prettier
```

## Environment Variables

`.env.local.example` を参考に `.env.local` を作成してください。

## Deployment

mainブランチへのマージでCloudflare Pagesが自動デプロイします。

## License

© 2025 ADA Lab. All rights reserved.

## Contact

- **Web**: [adalabtech.com](https://adalabtech.com)
- **Email**: info.adalabtech@gmail.com
- **X**: [@ADA_Lab_tech](https://x.com/ADA_Lab_tech)
- **Discord**: [ADA Lab](https://discord.gg/7Egm8uJPDs)
