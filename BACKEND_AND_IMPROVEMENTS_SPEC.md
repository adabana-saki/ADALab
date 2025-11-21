# ADA Lab バックエンド & フロントエンド改善設計書

## 概要

Vercel で運用可能なバックエンド API と、フロントエンドの改善・新機能を設計する。

---

## Phase 1: バックエンド API（Vercel Serverless Functions）

### 1.1 Contact Form API

**ファイル**: `app/api/contact/route.ts`

```typescript
// 機能
- メール送信（Resend / Nodemailer）
- reCAPTCHA v3 検証
- レート制限（Upstash Redis）
- Zod バリデーション

// エンドポイント
POST /api/contact
Body: { name, email, company?, message, recaptchaToken }
Response: { success: boolean, message: string }
```

**必要なパッケージ**:
```bash
npm install resend @upstash/ratelimit @upstash/redis
```

**環境変数**:
```env
RESEND_API_KEY=
RECAPTCHA_SECRET_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
CONTACT_EMAIL=info.adalabtech@gmail.com
```

### 1.2 Analytics API

**ファイル**: `app/api/analytics/route.ts`

```typescript
// 機能
- ページビュー記録
- イベントトラッキング
- 匿名化された統計データ

// エンドポイント
POST /api/analytics
Body: { event: string, page: string, metadata?: object }
```

### 1.3 Newsletter API（オプション）

**ファイル**: `app/api/newsletter/route.ts`

```typescript
// 機能
- メールリスト登録
- Resend Audiences 連携

// エンドポイント
POST /api/newsletter
Body: { email: string }
```

### 1.4 OGP 動的生成 API

**ファイル**: `app/api/og/route.tsx`

```typescript
// 機能
- @vercel/og で動的 OGP 画像生成
- ページ別カスタム画像

// エンドポイント
GET /api/og?title=...&description=...
```

**必要なパッケージ**:
```bash
npm install @vercel/og
```

---

## Phase 2: フロントエンド改善

### 2.1 パフォーマンス最適化

| 項目 | 現状 | 改善 |
|------|------|------|
| 画像最適化 | 未実装 | next/image + WebP |
| フォント | Google Fonts（外部） | next/font でローカル化 |
| Three.js | 常時ロード | dynamic import + Suspense |
| アニメーション | 全画面適用 | Viewport 内のみ実行 |

**実装例 - Three.js 遅延読み込み**:
```typescript
const NeuralNetwork = dynamic(
  () => import('@/components/effects/NeuralNetwork'),
  { ssr: false, loading: () => <div className="h-screen" /> }
);
```

### 2.2 アクセシビリティ強化

- [ ] Skip to content リンク追加
- [ ] キーボードフォーカス可視化改善
- [ ] aria-live リージョン（通知用）
- [ ] カラーコントラスト検証（WCAG AA）
- [ ] prefers-reduced-motion 完全対応

### 2.3 SEO 改善

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://adalab.tech'),
  title: {
    default: 'ADA Lab - あなたの"ほしい"を、カタチに',
    template: '%s | ADA Lab',
  },
  description: '...',
  openGraph: {
    images: ['/api/og'],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

### 2.4 エラーハンドリング

- [ ] `app/error.tsx` - グローバルエラー境界
- [ ] `app/global-error.tsx` - ルートレイアウトエラー
- [ ] API エラーの統一フォーマット
- [ ] Sentry 統合（オプション）

### 2.5 ローディング状態

- [ ] `app/loading.tsx` - ページ遷移時スケルトン
- [ ] Suspense 境界の適切な配置
- [ ] ボタン/フォームのローディング状態統一

---

## Phase 3: 新機能

### 3.1 ブログ/お知らせセクション

**目的**: 製品アップデート、技術記事の発信

```
app/
├── blog/
│   ├── page.tsx          # 記事一覧
│   └── [slug]/
│       └── page.tsx      # 記事詳細
content/
└── posts/
    └── *.mdx             # MDX 記事
```

**必要なパッケージ**:
```bash
npm install @next/mdx @mdx-js/loader contentlayer next-contentlayer
```

### 3.2 製品詳細ページ

**目的**: Rem bot / Navi の詳細情報

```
app/
└── products/
    ├── page.tsx          # 製品一覧
    ├── rem/
    │   └── page.tsx      # Rem bot 詳細
    └── navi/
        └── page.tsx      # Navi 詳細
```

**含める内容**:
- スクリーンショット/デモ動画
- 機能一覧
- セットアップガイド
- 料金プラン（該当する場合）
- FAQ

### 3.3 ダークモード切り替え

```typescript
// contexts/ThemeContext.tsx
- システム設定の検出
- localStorage での永続化
- スムーズなトランジション
```

### 3.4 多言語対応強化

現在の実装を拡張:
- [ ] URL パス方式 (`/en/`, `/ja/`)
- [ ] SEO 用 hreflang タグ
- [ ] 言語別 OGP

### 3.5 PWA 対応

```typescript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});
```

**必要なファイル**:
- `public/manifest.json`
- `public/sw.js`（自動生成）
- アイコンセット（192x192, 512x512）

---

## Phase 4: インフラ & DevOps

### 4.1 環境変数

```env
# Required
RESEND_API_KEY=
RECAPTCHA_SECRET_KEY=
CONTACT_EMAIL=

# Optional
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_GA_ID=
SENTRY_DSN=
```

### 4.2 Vercel 設定

```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ],
  "redirects": [
    { "source": "/discord", "destination": "https://discord.gg/...", "permanent": false }
  ]
}
```

### 4.3 CI/CD

```yaml
# .github/workflows/ci.yml
- Lint チェック
- Type チェック
- Build テスト
- Lighthouse CI（パフォーマンス監視）
```

---

## 実装優先順位

### 高優先度（すぐに実装）
1. Contact Form API（メール送信機能化）
2. OGP 動的生成
3. SEO メタデータ完全化
4. エラーページ（error.tsx）

### 中優先度（1-2週間）
5. reCAPTCHA 統合
6. レート制限
7. パフォーマンス最適化
8. アクセシビリティ改善

### 低優先度（将来）
9. ブログセクション
10. 製品詳細ページ
11. PWA 対応
12. Analytics API

---

## 必要なパッケージ一覧

```bash
# バックエンド
npm install resend @upstash/ratelimit @upstash/redis @vercel/og

# フロントエンド改善
npm install next-seo @next/font

# 新機能（オプション）
npm install @next/mdx contentlayer next-pwa
```

---

## ファイル構成（完成形）

```
app/
├── api/
│   ├── contact/
│   │   └── route.ts
│   ├── analytics/
│   │   └── route.ts
│   ├── newsletter/
│   │   └── route.ts
│   └── og/
│       └── route.tsx
├── blog/
│   ├── page.tsx
│   └── [slug]/
│       └── page.tsx
├── products/
│   ├── page.tsx
│   ├── rem/
│   │   └── page.tsx
│   └── navi/
│       └── page.tsx
├── error.tsx
├── global-error.tsx
├── loading.tsx
└── not-found.tsx (✅ 実装済み)
```

---

## 次のアクション

1. この設計書をレビュー
2. 優先度の確認・調整
3. Phase 1 から順次実装開始

実装を開始しますか？
