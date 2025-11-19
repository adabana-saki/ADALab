# デプロイメントガイド

このドキュメントは、ADA LabプロジェクトのCI/CDパイプラインとデプロイメントプロセスについて説明します。

## 目次

- [CI/CDパイプライン概要](#cicdパイプライン概要)
- [GitHub Actions ワークフロー](#github-actions-ワークフロー)
- [Vercel デプロイメント](#vercel-デプロイメント)
- [環境変数の設定](#環境変数の設定)
- [デプロイメント手順](#デプロイメント手順)

## CI/CDパイプライン概要

本プロジェクトは以下のCI/CDパイプラインを使用しています：

```
コミット/PR作成
    ↓
GitHub Actions (CI)
  ├─ Lint (ESLint)
  ├─ Type Check (TypeScript)
  ├─ Build Test
  ├─ Security Scan
  └─ Lighthouse CI (PR only)
    ↓
Vercel (Deployment)
  ├─ Preview (PR)
  └─ Production (main)
```

## GitHub Actions ワークフロー

### 1. CI ワークフロー (`.github/workflows/ci.yml`)

すべてのプッシュとプルリクエストで実行されます。

**トリガー:**
- `push`: `main`, `develop`, `claude/**` ブランチ
- `pull_request`: `main`, `develop` ブランチ

**ジョブ:**
- **Lint**: ESLintによるコード品質チェック
- **Type Check**: TypeScriptの型チェック
- **Build**: Next.jsビルドテスト
- **Lighthouse CI**: パフォーマンス計測（PR のみ）

**使用方法:**
```bash
# ローカルで同じチェックを実行
npm run lint        # ESLint
npx tsc --noEmit   # Type Check
npm run build      # Build
```

### 2. セキュリティワークフロー (`.github/workflows/security.yml`)

**トリガー:**
- `push`: `main`, `develop` ブランチ
- `pull_request`: `main`, `develop` ブランチ
- `schedule`: 毎週月曜日 9:00 AM UTC

**ジョブ:**
- **Dependency Review**: 依存関係の脆弱性チェック（PR のみ）
- **NPM Audit**: パッケージの脆弱性スキャン
- **CodeQL Analysis**: コードの静的解析

### 3. プレビューデプロイワークフロー (`.github/workflows/deploy-preview.yml`)

**トリガー:**
- `pull_request`: `main` ブランチへのPR

**機能:**
- Vercel Preview環境への自動デプロイ
- PRにプレビューURLをコメント

### 4. 本番デプロイワークフロー (`.github/workflows/deploy-production.yml`)

**トリガー:**
- `push`: `main` ブランチ

**機能:**
- Vercel Production環境への自動デプロイ
- デプロイメントサマリーの生成

## Vercel デプロイメント

### 自動デプロイ

Vercelは以下の条件で自動的にデプロイされます：

- **Preview環境**: すべてのプルリクエスト
- **Production環境**: `main` ブランチへのプッシュ

### Vercel設定 (`vercel.json`)

```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "git": {
    "deploymentEnabled": {
      "main": true,
      "develop": false
    }
  }
}
```

**主な設定:**
- セキュリティヘッダー（X-Frame-Options, CSPなど）
- キャッシュ制御（静的アセット: 1年、動的コンテンツ: 1日）
- Permissions-Policy設定

## 環境変数の設定

### GitHub Secrets

以下のシークレットをGitHubリポジトリに設定してください：

**必須:**
- `VERCEL_TOKEN`: Vercel APIトークン
- `VERCEL_ORG_ID`: Vercel組織ID（任意）
- `VERCEL_PROJECT_ID`: VercelプロジェクトID（任意）

**オプション:**
- `LHCI_GITHUB_APP_TOKEN`: Lighthouse CI GitHub Appトークン

**設定方法:**
1. GitHubリポジトリ → Settings → Secrets and variables → Actions
2. "New repository secret" をクリック
3. シークレット名と値を入力

### Vercelトークンの取得

1. [Vercel Settings](https://vercel.com/account/tokens) にアクセス
2. "Create Token" をクリック
3. トークン名を入力（例: `github-actions`）
4. スコープを選択（フルアクセス推奨）
5. 生成されたトークンをコピーしてGitHub Secretsに追加

### Vercel環境変数

Vercelダッシュボードで以下を設定：

**本番環境:**
- `NODE_ENV=production`
- `NEXT_TELEMETRY_DISABLED=1`（任意）

**設定方法:**
1. Vercelダッシュボード → プロジェクト → Settings → Environment Variables
2. 変数を追加
3. 環境を選択（Production / Preview / Development）

## デプロイメント手順

### 1. 開発フロー

```bash
# 1. 新しいブランチを作成
git checkout -b feature/new-feature

# 2. 変更を加える
# ... コードを編集 ...

# 3. ローカルでテスト
npm run lint
npm run build
npm run start

# 4. コミット & プッシュ
git add .
git commit -m "feat: 新機能を追加"
git push origin feature/new-feature
```

### 2. プルリクエスト

1. GitHubでプルリクエストを作成
2. GitHub Actionsが自動的にCI/CDパイプラインを実行
3. Vercelが自動的にプレビュー環境をデプロイ
4. PRにプレビューURLがコメントされる
5. レビュー & テスト
6. 問題なければマージ

### 3. 本番デプロイ

```bash
# mainブランチにマージ後、自動的に本番環境へデプロイ
git checkout main
git pull origin main
git merge feature/new-feature
git push origin main
```

**自動的に実行されること:**
1. GitHub ActionsがCIパイプラインを実行
2. すべてのチェックが成功したら、Vercelが本番環境へデプロイ
3. デプロイメントサマリーが生成される

### 4. 手動デプロイ（緊急時）

```bash
# Vercel CLIを使用
npm install -g vercel
vercel login
vercel --prod
```

## トラブルシューティング

### ビルドエラー

```bash
# ローカルでビルドテスト
npm run build

# TypeScriptエラーの確認
npx tsc --noEmit

# ESLintエラーの確認
npm run lint
```

### デプロイエラー

1. **Vercelダッシュボード**でビルドログを確認
2. **GitHub Actions**のログを確認
3. 環境変数が正しく設定されているか確認

### キャッシュクリア

```bash
# ローカルキャッシュ
rm -rf .next node_modules
npm install
npm run build

# Vercel キャッシュ
# Vercelダッシュボード → Deployments → ... → Redeploy
```

## パフォーマンス最適化

### Lighthouse CI

プルリクエストごとにLighthouse CIが実行され、以下の指標をチェック：

- **Performance**: 80%以上
- **Accessibility**: 90%以上
- **Best Practices**: 90%以上
- **SEO**: 90%以上
- **PWA**: 80%以上（警告のみ）

### Core Web Vitals目標値

- **FCP** (First Contentful Paint): < 2.0s
- **LCP** (Largest Contentful Paint): < 2.5s
- **CLS** (Cumulative Layout Shift): < 0.1
- **TBT** (Total Blocking Time): < 300ms
- **TTI** (Time to Interactive): < 3.5s

## セキュリティ

### 定期スキャン

- **CodeQL**: コードの脆弱性を検出
- **Dependency Review**: 依存関係の脆弱性をチェック
- **NPM Audit**: パッケージの既知の脆弱性をスキャン

### セキュリティヘッダー

すべてのレスポンスに以下のヘッダーが付与されます：

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

## 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
