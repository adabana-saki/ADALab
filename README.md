# ADA Lab - Official Website

ADA Labの公式ホームページ。最先端の技術で構築された、革新的なソフトウェア・アプリ開発事業のためのWebサイトです。

## 🚀 特徴

- **最新技術スタック**: Next.js 14, React 18, TypeScript
- **美しいUI/UX**: Tailwind CSS, Framer Motion
- **3Dビジュアル**: Three.js, React Three Fiber
- **高パフォーマンス**: 最適化されたロード時間とスムーズな動作
- **完全レスポンシブ**: あらゆるデバイスで完璧な体験
- **SEO最適化**: 検索エンジンに最適化

## 📋 技術スタック

### コア
- Next.js 14 (App Router)
- React 18
- TypeScript 5

### スタイリング・アニメーション
- Tailwind CSS 3
- Framer Motion 11
- React Three Fiber

### 開発ツール
- ESLint
- Prettier
- Husky

## 🛠️ セットアップ

### 前提条件
- Node.js 20.x 以上
- npm 10.x 以上

### インストール

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバーの起動
npm start
```

## 📁 プロジェクト構造

```
/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # ルートレイアウト
│   ├── page.tsx             # ホームページ
│   └── globals.css          # グローバルスタイル
├── components/              # コンポーネント
│   ├── sections/           # セクションコンポーネント
│   ├── ui/                 # 再利用可能なUI
│   ├── 3d/                 # Three.jsコンポーネント
│   └── animations/         # アニメーション
├── lib/                     # ユーティリティ関数
├── types/                   # TypeScript型定義
├── public/                  # 静的ファイル
└── DESIGN.md               # 設計書
```

## 📝 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start

# Lint実行
npm run lint

# コードフォーマット
npm run format
```

## 🎨 デザインシステム

### カラーパレット
- Primary: Blue (#3b82f6)
- Secondary: Cyan (#06b6d4)
- Accent: Purple (#8b5cf6)
- Background: Dark (#0a0a0a, #111111)

### タイポグラフィ
- フォント: Inter
- 見出し: 4rem - 6rem
- 本文: 1rem - 1.125rem

## 📱 レスポンシブ

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🚀 デプロイ

### Vercel（推奨）

**完全無料でデプロイできます！**

#### 方法1: Web UI（初心者向け）

1. [Vercel](https://vercel.com/signup)でアカウント作成
2. GitHubと連携
3. 「Import Project」をクリック
4. このリポジトリを選択
5. 「Deploy」ボタンをクリック → 完了！

#### 方法2: CLI（開発者向け）

```bash
# Vercel CLIをインストール
npm i -g vercel

# ログイン
vercel login

# デプロイ（プレビュー）
vercel

# 本番デプロイ
vercel --prod
```

### 無料枠

- ✅ 帯域幅: 100 GB/月
- ✅ ビルド時間: 6,000分/月
- ✅ プロジェクト数: 無制限
- ✅ カスタムドメイン対応
- ✅ 自動HTTPS
- ✅ グローバルCDN

**月間5万PVまで余裕で対応可能**

### 環境変数

現在、環境変数は不要です。将来的に必要になった場合は、Vercelダッシュボードの「Settings」→「Environment Variables」から設定してください。

## 📄 ライセンス

© 2024 ADA Lab. All rights reserved.

## 📧 お問い合わせ

- Email: contact@ada-lab.com
- Website: https://ada-lab.com

---

詳細な設計書は [DESIGN.md](./DESIGN.md) を参照してください。
技術スタックの詳細は [TECH_STACK.md](./TECH_STACK.md) を参照してください。
