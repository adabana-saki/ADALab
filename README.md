# ADA Lab

**あなたの"ほしい"を、カタチに**

[![Website](https://img.shields.io/badge/Website-ada--lab.vercel.app-blue)](https://ada-lab.vercel.app)
[![CI](https://github.com/adabana-saki/ADALab/actions/workflows/ci.yml/badge.svg)](https://github.com/adabana-saki/ADALab/actions/workflows/ci.yml)

ADA Labは、シンプルで使いやすいアプリやサービスを開発する個人開発チームです。

## プロダクト

### Rem bot
Discord多機能Bot。リマインダー、タスク管理、ロール管理など、Discordライフを便利にする機能を提供します。

**主な機能:**
- リマインダー（自然言語対応）
- タスク管理
- ロール管理
- 自動応答

### Navi
片手操作特化アプリ。スマートフォンを片手で快適に操作するためのユーティリティです。

**主な機能:**
- 片手操作最適化
- カスタムジェスチャー
- クイックアクション
- ウィジェット

## ウェブサイト

公式サイト: https://ada-lab.vercel.app

- ホームページ
- ブログ（/blog）
- 製品詳細（/products）
- お問い合わせ（/contact）

## お問い合わせ

- **Email**: info.adalabtech@gmail.com
- **GitHub**: [@adabana-saki](https://github.com/adabana-saki)
- **X (Twitter)**: [@saki_18191](https://x.com/saki_18191)

## 開発者向け

### セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# 本番ビルド
npm run build
```

### 技術スタック

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion

### 環境変数

本番環境では以下の環境変数が必要です：

```env
RESEND_API_KEY=           # メール送信
CONTACT_EMAIL=            # お問い合わせ送信先
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=  # reCAPTCHA
RECAPTCHA_SECRET_KEY=     # reCAPTCHA
UPSTASH_REDIS_REST_URL=   # レート制限
UPSTASH_REDIS_REST_TOKEN= # レート制限
```

### ドキュメント

詳細なドキュメントは `docs/` フォルダを参照してください。

- [DEPLOYMENT.md](./docs/DEPLOYMENT.md) - デプロイガイド
- [TECH_STACK.md](./docs/TECH_STACK.md) - 技術スタック詳細
- [DESIGN.md](./docs/DESIGN.md) - デザイン仕様

## ライセンス

© 2024 ADA Lab. All rights reserved.
