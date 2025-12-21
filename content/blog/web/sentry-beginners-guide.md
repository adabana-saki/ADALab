---
title: "【初心者向け】Sentryでエラー監視を始めよう - 導入から使い方まで完全解説"
date: "2025-12-23"
publishDate: "2025-12-23"
description: "Sentryの導入方法から実際の使い方まで、初心者にもわかりやすく解説。Next.jsでの設定例、ダッシュボードの見方、エラーの対処法を紹介します。"
tags: ["Sentry", "エラー監視", "Next.js", "JavaScript", "モニタリング"]
category: "web"
draft: false
---

# 【初心者向け】Sentryでエラー監視を始めよう

「サイトでエラーが起きてるのに気づかなかった...」

そんな経験はありませんか？ユーザーからの報告で初めてバグに気づくのは、開発者として避けたい状況です。

この記事では、**Sentry**を使ってエラーを自動検知・通知する方法を初心者向けに解説します。

## Sentryとは？

Sentryは**エラー監視サービス**です。サイトやアプリで発生したエラーを自動的にキャッチして、開発者に通知してくれます。

### Sentryでできること

| 機能 | 説明 |
|------|------|
| エラー検知 | JavaScript/Pythonなど多言語対応 |
| リアルタイム通知 | Slack/メールでアラート |
| スタックトレース | エラー発生箇所を特定 |
| Session Replay | ユーザーの操作を再現 |
| パフォーマンス計測 | ページ速度の監視 |

### 料金

- **無料プラン**: 5,000エラー/月、1ユーザー
- **有料プラン**: $26/月〜

個人開発や小規模サイトなら**無料プランで十分**です。

---

## Step 1: Sentryアカウントを作成

1. [Sentry公式サイト](https://sentry.io) にアクセス
2. 「Get Started Free」をクリック
3. GitHub/Google/メールで登録

---

## Step 2: プロジェクトを作成

1. ログイン後、「Create Project」をクリック
2. プラットフォームを選択（例: **React** または **Next.js**）
3. プロジェクト名を入力（例: `my-website`）
4. 「Create Project」をクリック

作成後、**DSN（Data Source Name）**が表示されます。これは後で使うのでコピーしておきましょう。

```
https://xxxxxxxxxxxx@o123456.ingest.sentry.io/1234567
```

---

## Step 3: Next.jsに導入する

### 3-1. パッケージをインストール

```bash
npm install @sentry/react
```

### 3-2. 環境変数を設定

`.env.local` に以下を追加：

```bash
NEXT_PUBLIC_SENTRY_DSN=https://xxxx@xxxx.ingest.sentry.io/xxxx
```

### 3-3. Sentryプロバイダーを作成

`components/analytics/SentryProvider.tsx` を作成：

```typescript
'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/react';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

export function SentryProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (SENTRY_DSN && process.env.NODE_ENV === 'production') {
      Sentry.init({
        dsn: SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 0.1, // パフォーマンス計測のサンプリング率
      });
    }
  }, []);

  return <>{children}</>;
}
```

### 3-4. レイアウトに追加

`app/layout.tsx` でプロバイダーをラップ：

```typescript
import { SentryProvider } from '@/components/analytics/SentryProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SentryProvider>
          {children}
        </SentryProvider>
      </body>
    </html>
  );
}
```

### 3-5. デプロイ

環境変数を本番環境（Vercel/Cloudflare Pages）に設定して、デプロイします。

---

## Step 4: 動作確認

### 方法1: 実際にエラーを発生させる

ブラウザのコンソールで以下を実行：

```javascript
throw new Error("Sentry Test Error");
```

### 方法2: 存在しないページにアクセス

サイトで存在しないURLにアクセスして404エラーを発生させます。

### 確認

Sentryダッシュボードの「Issues」に新しいエラーが表示されれば成功です！

---

## Sentryダッシュボードの見方

### Issues（イシュー）画面

エラーの一覧が表示されます。

| 項目 | 意味 |
|------|------|
| Error | エラーメッセージ |
| Events | 発生回数 |
| Users | 影響を受けたユーザー数 |
| Last Seen | 最後に発生した時刻 |
| First Seen | 初めて発生した時刻 |

### エラー詳細画面

イシューをクリックすると詳細が表示されます：

1. **Stack Trace** - エラーが発生したコードの場所
2. **Breadcrumbs** - エラー発生前のユーザーの操作履歴
3. **Tags** - ブラウザ、OS、URLなどの情報
4. **Session Replay** - ユーザーの画面操作を動画で再現（設定時）

### よくあるエラーの例

#### TypeError: Cannot read property 'xxx' of undefined

```
未定義のオブジェクトのプロパティにアクセスしようとした
→ nullチェックを追加
```

#### ChunkLoadError

```
JavaScriptファイルの読み込み失敗
→ キャッシュクリア、または再デプロイ
```

#### Network Error

```
API呼び出しの失敗
→ サーバー側の問題、またはCORS設定を確認
```

---

## 便利な機能

### アラート設定

特定の条件でSlackやメールに通知：

1. 「Alerts」→「Create Alert」
2. 条件を設定（例: 1時間に10回以上発生）
3. 通知先を選択（Slack/メール）

### イシューの管理

- **Resolve** - 修正済みとしてマーク
- **Ignore** - 無視する（意図的なエラーなど）
- **Archive** - アーカイブに移動

### リリースとの紐付け

デプロイ時にリリース情報を送信すると、どのバージョンでエラーが発生したか追跡できます：

```typescript
Sentry.init({
  dsn: SENTRY_DSN,
  release: 'my-app@1.0.0', // バージョン番号
});
```

---

## トラブルシューティング

### エラーがSentryに送信されない

1. **DSNが正しいか確認**
2. **本番環境か確認**（開発環境では送信しない設定の場合）
3. **CSPヘッダーを確認**（`*.ingest.sentry.io`を許可）
4. **広告ブロッカーを無効化**

### CSPヘッダーの設定例

Cloudflare Pagesの場合、`public/_headers`に追加：

```
/*
  Content-Security-Policy: connect-src 'self' *.ingest.sentry.io;
```

---

## まとめ

Sentryを導入すると：

- ユーザーより先にエラーに気づける
- エラーの発生箇所を特定できる
- どのブラウザ/デバイスで起きているかわかる

無料プランでも十分使えるので、個人開発サイトにもおすすめです。

---

質問があれば[X（@ADA_Lab_tech）](https://x.com/ADA_Lab_tech)までどうぞ！
