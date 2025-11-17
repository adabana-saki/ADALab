# ADA Lab - 技術スタック詳細

## フロントエンド

### コアフレームワーク

#### Next.js 14
- **バージョン**: 14.x (App Router)
- **選定理由**:
  - Server Components による高速レンダリング
  - 自動コード分割とルーティング最適化
  - 優れた開発者体験
  - Vercelとのシームレスな統合
  - ISR/SSG/SSRの柔軟な選択

#### React 18
- **主要機能**:
  - Concurrent Features
  - Automatic Batching
  - Server Components
  - Suspense for Data Fetching

#### TypeScript 5
- **設定**:
  - Strict mode有効
  - Path aliases設定
  - 厳格な型チェック
- **メリット**:
  - 型安全性
  - IntelliSense強化
  - リファクタリング容易性

---

## スタイリング

### Tailwind CSS 3
- **バージョン**: 3.4+
- **カスタム設定**:
  ```javascript
  theme: {
    extend: {
      colors: {
        primary: {...},
        accent: {...}
      },
      animation: {
        'fade-in': '...',
        'slide-up': '...'
      }
    }
  }
  ```

### CSS-in-JS
- **Framer Motion**: アニメーション専用
- **利点**:
  - Tailwindでカバーできない複雑なアニメーション
  - ジェスチャーハンドリング

---

## アニメーション・3D

### Framer Motion
- **バージョン**: 11.x
- **用途**:
  - ページトランジション
  - スクロールアニメーション
  - マイクロインタラクション
  - ジェスチャー検知

**主要機能**:
```typescript
- motion components
- useScroll, useTransform
- AnimatePresence
- Layout animations
- Variants system
```

### Three.js + React Three Fiber
- **Three.js**: r160+
- **React Three Fiber (R3F)**: 8.x
- **@react-three/drei**: 9.x
- **@react-three/postprocessing**: 2.x

**用途**:
- Heroセクションの3D背景
- パーティクルシステム
- インタラクティブ3Dオブジェクト
- ポストエフェクト（グロー、ブルーム）

**パフォーマンス考慮**:
- モバイルでは簡易版/無効化
- Suspenseによる遅延ロード
- 適切なポリゴン数管理

---

## UIコンポーネント

### shadcn/ui
- **ベース**: Radix UI
- **コンポーネント**:
  - Button
  - Card
  - Dialog
  - Form
  - Input
  - Select
  - Toast

**選定理由**:
- コピー&ペースト方式（依存関係最小限）
- カスタマイズ容易
- アクセシビリティ標準準拠
- Tailwindネイティブ

### Radix UI
- **Primitives使用**:
  - @radix-ui/react-dialog
  - @radix-ui/react-dropdown-menu
  - @radix-ui/react-scroll-area

**メリット**:
- WAI-ARIA準拠
- キーボードナビゲーション
- フォーカス管理

---

## アイコン・イラスト

### Lucide React
- **バージョン**: latest
- **特徴**:
  - 1000+のアイコン
  - 軽量（Tree-shakable）
  - カスタマイズ可能

### オプション
- React Icons（補完用）
- カスタムSVGアニメーション

---

## フォーム管理

### React Hook Form
- **バージョン**: 7.x
- **用途**: Contactフォーム
- **メリット**:
  - 最小限の再レンダリング
  - 簡潔なAPI
  - バリデーション統合

### Zod
- **バージョン**: 3.x
- **用途**: スキーマバリデーション
- **統合**: React Hook Formと組み合わせ

```typescript
const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(10)
});
```

---

## ユーティリティ

### clsx / tailwind-merge
```typescript
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### date-fns
- 日付フォーマット用

---

## 開発ツール

### Linting・Formatting

#### ESLint
- **設定**: Next.js推奨 + カスタムルール
- **プラグイン**:
  - @typescript-eslint
  - eslint-plugin-react
  - eslint-plugin-react-hooks

#### Prettier
- **統合**: ESLintと連携
- **設定**:
  ```json
  {
    "semi": true,
    "singleQuote": true,
    "tabWidth": 2,
    "trailingComma": "es5"
  }
  ```

### Git Hooks

#### Husky
- pre-commit: lint-staged実行
- commit-msg: コミットメッセージ検証

#### lint-staged
```json
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
```

---

## パッケージマネージャー

### pnpm
- **選定理由**:
  - npmより高速
  - ディスクスペース効率的
  - Strictモード

---

## 開発環境

### Node.js
- **バージョン**: 20.x LTS
- **理由**: 最新の安定版、最適なパフォーマンス

### エディタ推奨設定
- VS Code
- 推奨拡張機能:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - Prettier - Code formatter
  - ESLint

---

## デプロイ・ホスティング

### Vercel
- **選定理由**:
  - Next.js最適化
  - Edge Functions
  - 自動HTTPS
  - Git連携
  - Analytics標準搭載

### 環境変数管理
- Vercel Environment Variables
- .env.local（開発環境）

---

## パフォーマンス最適化

### 画像最適化
- Next.js Image Component
- 自動WebP変換
- Lazy Loading
- Blur Placeholder

### フォント最適化
- next/font (Font Optimization)
- 自動サブセット化
- フォールバック設定

### バンドル最適化
- Tree Shaking
- Dynamic Import
- Route-based Code Splitting

```typescript
const Scene = dynamic(() => import('@/components/3d/Scene'), {
  ssr: false,
  loading: () => <Loader />
});
```

---

## SEO・Analytics

### Next.js Metadata API
```typescript
export const metadata: Metadata = {
  title: 'ADA Lab',
  description: '...',
  openGraph: {...},
  twitter: {...}
};
```

### Vercel Analytics
- Web Vitals計測
- ユーザー分析

### オプション
- Google Analytics 4
- Google Search Console

---

## セキュリティ

### Headers
```javascript
// next.config.js
async headers() {
  return [
    {
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' }
      ]
    }
  ];
}
```

### CSP (Content Security Policy)
- 適切なディレクティブ設定
- nonce-based CSP

---

## 依存関係一覧

### Production Dependencies
```json
{
  "next": "^14.2.0",
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "framer-motion": "^11.0.0",
  "@react-three/fiber": "^8.16.0",
  "@react-three/drei": "^9.105.0",
  "@react-three/postprocessing": "^2.16.0",
  "three": "^0.163.0",
  "react-hook-form": "^7.51.0",
  "zod": "^3.22.0",
  "@hookform/resolvers": "^3.3.0",
  "lucide-react": "^0.368.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^2.2.0",
  "class-variance-authority": "^0.7.0"
}
```

### Development Dependencies
```json
{
  "typescript": "^5.4.0",
  "@types/react": "^18.3.0",
  "@types/node": "^20.12.0",
  "@types/three": "^0.163.0",
  "tailwindcss": "^3.4.0",
  "postcss": "^8.4.0",
  "autoprefixer": "^10.4.0",
  "eslint": "^8.57.0",
  "eslint-config-next": "^14.2.0",
  "prettier": "^3.2.0",
  "prettier-plugin-tailwindcss": "^0.5.0",
  "husky": "^9.0.0",
  "lint-staged": "^15.2.0"
}
```

---

## アーキテクチャ原則

### コンポーネント設計
- **Single Responsibility**: 各コンポーネントは単一の責務
- **Composition over Inheritance**: コンポーネント合成優先
- **Container/Presentational Pattern**: ロジックと見た目の分離

### ファイル命名規則
- Components: PascalCase (Hero.tsx)
- Utilities: camelCase (utils.ts)
- Constants: UPPER_SNAKE_CASE

### Import順序
```typescript
// 1. External libraries
import React from 'react';
import { motion } from 'framer-motion';

// 2. Internal absolute imports
import { Button } from '@/components/ui/button';

// 3. Relative imports
import { Hero } from './sections/Hero';

// 4. Types
import type { ComponentProps } from '@/types';
```

---

## テスト戦略（オプション）

### Testing Library
- Jest
- React Testing Library
- Playwright（E2E）

---

## 将来的な拡張可能性

### CMS統合
- Contentful
- Sanity
- Notion API

### 国際化
- next-intl
- 多言語対応

### ブログ機能
- MDX
- Syntax Highlighting

---

## まとめ

この技術スタックにより:

✅ **最先端**: 2024年現在の最新技術
✅ **パフォーマンス**: 最適化されたロード時間
✅ **開発体験**: TypeScript + 充実したツール
✅ **スケーラビリティ**: 将来の拡張に対応
✅ **保守性**: クリーンなコードと明確な構造
