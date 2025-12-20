# ADA Lab 公式サイト

[![Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-orange)](https://adalabtech.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)

ADA Labの公式Webサイトのソースコードです。

🌐 **サイトURL**: <https://adalabtech.com/>

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

<http://localhost:3000> でサイトが表示されます。

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

- 一覧ページ: <http://localhost:3000/blog>
- 記事ページ: <http://localhost:3000/blog/my-new-post>

### 予約投稿

`publishDate`を設定すると、その日以降のビルドで自動公開されます。

```markdown
---
title: "来週公開する記事"
date: "2025-12-01"
publishDate: "2025-12-08"
---
```

毎朝9時(JST)にGitHub Actionsが定期ビルドを実行し、予約日が来た記事が自動的に公開されます。

## プロジェクト構成

```text
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

## アニメーションコンポーネント

このサイトには27以上の高品質なアニメーションコンポーネントが含まれています：

### テキストアニメーション
- **GlitchText** - グリッチエフェクト付きテキスト
- **TypingAnimation** - タイピングアニメーション
- **GradientText** - グラデーションアニメーション付きテキスト
- **ShimmerText** - シマーエフェクト付きテキスト
- **RevealText** - テキストリビールアニメーション
- **TextScramble** - テキストスクランブルエフェクト

### ボタンエフェクト
- **MagneticButton** - 磁気エフェクト付きボタン
- **ShinyButton** - 光沢エフェクト付きボタン

### 背景エフェクト
- **AnimatedBackground** - アニメーション背景
- **CyberGrid** - サイバーグリッド
- **MatrixRain** - マトリックス風レインエフェクト
- **DotPattern** - ドットパターン背景
- **WaveBackground** - 波のような背景エフェクト
- **ScanLines** - スキャンラインエフェクト
- **MouseGlow** - マウス追従グローエフェクト

### カードエフェクト
- **SpotlightCard** - スポットライトエフェクト付きカード

### その他のエフェクト
- **FloatingElements** - 浮遊エレメント
- **FloatingLogo3D** - 3D浮遊ロゴ
- **ParticleField** - パーティクルフィールド
- **CinematicIntro** - シネマティックイントロ
- **CounterAnimation** - カウンターアニメーション
- **DynamicIsland** - ダイナミックアイランド
- **CodeSandbox** - コードサンドボックス
- **TerminalEmulator** - ターミナルエミュレーター
- **GitHubHologram** - GitHub ホログラム
- **KonamiCode** - コナミコマンドイースターエッグ
- **RippleEffect** - リップルエフェクト
- **SuccessCelebration** - 成功お祝いエフェクト

すべてのコンポーネントは、propsを通じて高度にカスタマイズ可能です。

## スクリプト

```bash
npm run dev      # 開発サーバー起動
npm run build    # プロダクションビルド
npm run lint     # ESLintでコードチェック
npm run format   # Prettierでフォーマット
```

## デプロイ

mainブランチにマージすると、Cloudflare Pagesが自動でデプロイします。

## GitHub Secrets

予約投稿の定期ビルドを有効にするには、以下のSecretを設定してください。

| Secret名 | 説明 |
|----------|------|
| `CLOUDFLARE_DEPLOY_HOOK` | Cloudflare PagesのDeploy Hook URL |

### 設定手順

1. **Cloudflare Dashboard** → Pages → プロジェクト → Settings → Builds & deployments
2. 「Deploy hooks」セクションで新しいhookを作成
3. 生成されたURLをコピー
4. **GitHub** → リポジトリ → Settings → Secrets and variables → Actions
5. 「New repository secret」で `CLOUDFLARE_DEPLOY_HOOK` を追加

## お問い合わせ

- **Email**: info.adalabtech@gmail.com
- **X**: [@ADA_Lab_tech](https://x.com/ADA_Lab_tech)
- **Discord**: [ADA Lab](https://discord.gg/7Egm8uJPDs)

## ライセンス

© 2025 ADA Lab. All rights reserved.
