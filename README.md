<div align="center">

# ADA Lab

**あなたの"ほしい"を、カタチに。**

[![Live Site](https://img.shields.io/badge/Live-adalabtech.com-00d4aa?style=for-the-badge)](https://adalabtech.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15.1-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)

<img src="./public/opengraph-image.png" alt="ADA Lab" width="600">

</div>

---

## Overview

ADA Labの公式Webサイト。個人開発チームのポートフォリオサイトとして、プロダクト紹介・技術ブログ・ブラウザゲームを提供しています。

**運営**: Adabana Saki

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Cloudflare                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  CDN (Edge)  │  │  DDoS/WAF    │  │  Pages (Static Host) │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                     Static Site (Next.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   App Router │  │  Static HTML │  │  Client Components   │  │
│  │   (RSC)      │  │  (SSG)       │  │  (Hydration)         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      External Services                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Sentry     │  │  GA4         │  │  Upstash Redis       │  │
│  │   (Errors)   │  │  (Analytics) │  │  (Rate Limiting)     │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Static Export

Next.js の `output: 'export'` を使用した完全静的サイト。サーバーサイドの処理は不要で、Cloudflare Pages のエッジから直接配信されます。

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.1 | App Router + Static Export |
| React | 19 | UI Components |
| TypeScript | 5.6 | Type Safety |
| Tailwind CSS | 3.4 | Styling |
| Framer Motion | 11.x | Animations |
| Three.js | 0.170 | 3D Effects (React Three Fiber) |

### Content Processing

| Technology | Version | Purpose |
|------------|---------|---------|
| React Markdown | 10.x | Markdown Rendering |
| Shiki | 3.x | Syntax Highlighting |
| KaTeX | 0.16 | Math Rendering |
| Mermaid | 11.x | Diagrams |

### Infrastructure

| Service | Purpose |
|---------|---------|
| Cloudflare Pages | Hosting, CDN, DDoS Protection |
| GitHub Actions | CI/CD, Security Scanning |
| Upstash Redis | Serverless Rate Limiting |

### Monitoring

| Service | Purpose |
|---------|---------|
| Sentry | Error Tracking, Session Replay |
| Google Analytics 4 | Traffic Analytics |
| UptimeRobot | Uptime Monitoring |

## Features

### Core Features

- **Product Showcase** - プロダクト紹介ページ
- **Tech Blog** - Markdown対応の技術ブログ
- **Browser Games** - テトリスなどのミニゲーム
- **Multilingual** - 日本語/英語対応

### Blog Features

- Markdown + MDX サポート
- シンタックスハイライト（40+ 言語）
- 数式レンダリング（LaTeX）
- ダイアグラム生成（Mermaid）
- 予約投稿（GitHub Actions による毎日のビルド）
- OGP画像の自動生成

### UI/UX

- ダークモード対応
- レスポンシブデザイン
- キーボードショートカット
- 27種類以上のアニメーションエフェクト
- アクセシビリティ対応（Skip Links, ARIA）

## Security

### HTTP Headers

`public/_headers` で設定されたセキュリティヘッダー:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; ...
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Cross-Origin-Embedder-Policy: credentialless
```

### Security Measures

- **HSTS Preload** - ブラウザにHTTPS強制を事前登録
- **CSP** - スクリプト/スタイル/接続先を制限
- **CodeQL** - 静的解析による脆弱性検出
- **Dependency Review** - 依存関係の脆弱性チェック
- **npm audit** - 週次のセキュリティ監査

## CI/CD

### GitHub Actions Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | Push/PR | Lint, Type Check, Build, Lighthouse |
| `security.yml` | Push/PR/Weekly | CodeQL, npm audit, Dependency Review |
| `scheduled-deploy.yml` | Daily 9:00 JST | 予約投稿のためのビルド |

### Quality Gates

- ESLint によるコード品質チェック
- TypeScript の型チェック
- Lighthouse CI によるパフォーマンス計測
- Pre-commit hooks（Husky + lint-staged）

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── blog/              # ブログページ
│   ├── games/             # ブラウザゲーム
│   ├── products/          # プロダクト紹介
│   ├── tech-stack/        # 技術スタック
│   ├── security/          # セキュリティポリシー
│   └── ...                # その他ページ
├── components/
│   ├── 3d/                # Three.js 3Dコンポーネント
│   ├── analytics/         # GA, Sentry
│   ├── blog/              # ブログ関連
│   ├── effects/           # アニメーションエフェクト
│   ├── games/             # ゲームコンポーネント
│   ├── sections/          # ページセクション
│   └── ui/                # 共通UIコンポーネント
├── content/
│   └── blog/              # ブログ記事（Markdown）
├── contexts/              # React Context
├── hooks/                 # Custom Hooks
├── lib/                   # ユーティリティ
├── public/                # 静的ファイル
│   └── _headers           # Cloudflare セキュリティヘッダー
├── scripts/               # ビルドスクリプト
└── .github/workflows/     # GitHub Actions
```

## Development

### Prerequisites

- Node.js 20 LTS
- npm 10+

### Setup

```bash
# Clone
git clone https://github.com/adabana-saki/ADALab.git
cd ADALab

# Install
npm install

# Development
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Scripts

```bash
npm run dev       # Development server
npm run build     # Production build
npm run lint      # ESLint
npm run format    # Prettier
```

### Environment Variables

`.env.local.example` を参考に `.env.local` を作成:

```bash
# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Rate Limiting
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Contact Form
RESEND_API_KEY=
CONTACT_EMAILS=

# Search Engine Verification
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
NEXT_PUBLIC_BING_SITE_VERIFICATION=
```

## Blog

### Writing Posts

`content/blog/` に Markdown ファイルを追加:

````markdown
---
title: "記事タイトル"
date: "2025-01-01"
description: "記事の説明"
tags: ["Tag1", "Tag2"]
---

## 見出し

本文を記述...

コードブロック、数式（LaTeX）、Mermaidダイアグラムに対応しています。
````

### Scheduled Publishing

`publishDate` を設定すると予約投稿が可能。毎朝9時(JST)に自動ビルドが実行されます。

## Deployment

### Cloudflare Pages

mainブランチへのマージで自動デプロイ:

1. GitHub → Cloudflare Pages 連携
2. Build command: `npm run build`
3. Output directory: `out`

### Manual Deploy

```bash
npm run build
npx wrangler pages deploy out
```

## Performance

- **Lighthouse Score**: 90+ (Performance, Accessibility, Best Practices, SEO)
- **First Contentful Paint**: < 1.5s
- **Static Assets**: 1年キャッシュ（immutable）
- **Image Optimization**: AVIF/WebP対応

## License

© 2025 ADA Lab. All rights reserved.

## Contact

| Channel | Link |
|---------|------|
| Web | [adalabtech.com](https://adalabtech.com) |
| Email | info.adalabtech@gmail.com |
| X | [@ADA_Lab_tech](https://x.com/ADA_Lab_tech) |
| Discord | [ADA Lab](https://discord.gg/7Egm8uJPDs) |
