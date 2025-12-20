---
title: "Cloudflare D1でゲームランキングを実装 - 完全無料のサーバーレスDB入門"
date: "2025-12-20"
publishDate: "2025-12-20"
description: "Cloudflare D1を使ってゲームのグローバルランキング機能を実装する方法を解説。SQLiteベースのサーバーレスDBで、無料かつ永続的なデータ管理を実現します。"
tags: ["Cloudflare", "D1", "SQLite", "Next.js", "サーバーレス", "ゲーム開発"]
author: "Adabana Saki"
category: "Web開発"
---

# Cloudflare D1でゲームランキングを実装

ゲームにランキング機能を追加したい。でも、データベースの運用コストや管理が心配...

そんな悩みを解決するのが **Cloudflare D1** です。

この記事では、テトリスゲームにグローバルランキング機能を実装した実例を元に、D1の使い方を解説します。

## なぜCloudflare D1？

### 他のBaaSとの比較

| サービス | 無料枠 | 注意点 |
|----------|--------|--------|
| **Supabase** | PostgreSQL | 7日間アクセスなしで**停止** |
| **PlanetScale** | MySQL | 無料プランは**終了** |
| **Firebase** | NoSQL | 複雑なクエリが苦手 |
| **Cloudflare D1** | SQLite | **制限なし・永続** |

D1を選ぶ理由:

```
✅ 完全無料（制限緩い）
✅ 自動停止なし
✅ SQLite互換（馴染みやすい）
✅ Cloudflare Pagesと統合済み
✅ グローバルレプリケーション
```

### D1の制限（無料枠）

| 項目 | 制限 |
|------|------|
| データベース数 | 無制限 |
| ストレージ | 5GB |
| 読み取り | 500万回/日 |
| 書き込み | 10万回/日 |

個人プロジェクトには十分すぎる容量です。

## 実装の全体像

```
【アーキテクチャ】

┌─────────────┐    ┌──────────────────┐    ┌─────────────┐
│   ブラウザ    │───▶│ Cloudflare Pages │───▶│ Cloudflare  │
│ (ゲーム画面)  │    │    Functions     │    │     D1      │
└─────────────┘    └──────────────────┘    └─────────────┘
   スコア送信         API処理              永続化
```

実装するもの:
1. D1データベースとスキーマ
2. APIエンドポイント（Functions）
3. フロントエンドのカスタムフック

## Step 1: D1データベースの作成

### Wrangler CLIのインストール

```bash
npm install -D wrangler
```

### データベース作成

```bash
npx wrangler d1 create my-game-db
```

出力:

```
✅ Successfully created DB 'my-game-db'

[[d1_databases]]
binding = "DB"
database_name = "my-game-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### wrangler.tomlに追加

```toml
# wrangler.toml
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "my-game-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

## Step 2: スキーマ設計

### db/schema.sql

```sql
-- ランキングテーブル
CREATE TABLE IF NOT EXISTS leaderboard (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nickname TEXT NOT NULL,
  score INTEGER NOT NULL,
  lines INTEGER NOT NULL,
  level INTEGER NOT NULL,
  date TEXT NOT NULL,
  mode TEXT NOT NULL CHECK(mode IN ('endless', 'sprint')),
  time INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- スコア降順で取得を高速化
CREATE INDEX IF NOT EXISTS idx_score ON leaderboard(score DESC);

-- モード別取得を高速化
CREATE INDEX IF NOT EXISTS idx_mode_score ON leaderboard(mode, score DESC);
```

**ポイント**:
- `CHECK`制約でmodeの値を制限
- インデックスで検索を高速化
- `created_at`で登録日時を自動記録

### マイグレーション実行

ローカルで確認:

```bash
npx wrangler d1 execute my-game-db --local --file=./db/schema.sql
```

本番に適用:

```bash
npx wrangler d1 execute my-game-db --remote --file=./db/schema.sql
```

## Step 3: APIエンドポイント

### functions/api/games/leaderboard.ts

```typescript
interface Env {
  DB: D1Database;
}

interface LeaderboardEntry {
  nickname: string;
  score: number;
  lines: number;
  level: number;
  date: string;
  mode: 'endless' | 'sprint';
  time?: number;
}

// CORSヘッダー
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// OPTIONS: CORSプリフライト
export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { headers: corsHeaders });
};

// GET: ランキング取得
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const mode = url.searchParams.get('mode') || 'endless';

  try {
    const result = await env.DB.prepare(`
      SELECT nickname, score, lines, level, date, mode, time
      FROM leaderboard
      WHERE mode = ?
      ORDER BY score DESC
      LIMIT 10
    `).bind(mode).all();

    return new Response(
      JSON.stringify({ leaderboard: result.results }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Database error' }),
      { status: 500, headers: corsHeaders }
    );
  }
};

// POST: スコア登録
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const entry: LeaderboardEntry = await request.json();

    // バリデーション
    if (!entry.nickname || entry.nickname.length > 20) {
      return new Response(
        JSON.stringify({ error: 'Invalid nickname' }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (typeof entry.score !== 'number' || entry.score < 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid score' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // データ挿入
    await env.DB.prepare(`
      INSERT INTO leaderboard (nickname, score, lines, level, date, mode, time)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      entry.nickname.slice(0, 20),
      entry.score,
      entry.lines,
      entry.level,
      entry.date,
      entry.mode,
      entry.time || null
    ).run();

    // 更新後のランキングを返す
    const result = await env.DB.prepare(`
      SELECT nickname, score, lines, level, date, mode, time
      FROM leaderboard
      WHERE mode = ?
      ORDER BY score DESC
      LIMIT 10
    `).bind(entry.mode).all();

    return new Response(
      JSON.stringify({
        success: true,
        leaderboard: result.results,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to submit score' }),
      { status: 500, headers: corsHeaders }
    );
  }
};
```

**セキュリティポイント**:
- ニックネームの長さ制限
- スコアの型チェック
- SQLインジェクション対策（プリペアドステートメント）

## Step 4: フロントエンド実装

### hooks/useLeaderboard.ts

```typescript
'use client';

import { useState, useCallback, useEffect } from 'react';

interface LeaderboardEntry {
  nickname: string;
  score: number;
  lines: number;
  level: number;
  date: string;
  mode: 'endless' | 'sprint';
  time?: number;
}

const API_BASE = '/api/games/leaderboard';
const LOCAL_KEY = 'game-leaderboard-cache';

export function useLeaderboard(mode: 'endless' | 'sprint') {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // オンライン状態監視
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ローカルキャッシュから取得
  const getLocalCache = useCallback((): LeaderboardEntry[] => {
    try {
      const stored = localStorage.getItem(LOCAL_KEY);
      if (stored) {
        const all = JSON.parse(stored) as LeaderboardEntry[];
        return all.filter(e => e.mode === mode);
      }
    } catch {
      // ignore
    }
    return [];
  }, [mode]);

  // ローカルキャッシュに保存
  const saveLocalCache = useCallback((entries: LeaderboardEntry[]) => {
    try {
      const stored = localStorage.getItem(LOCAL_KEY);
      let all: LeaderboardEntry[] = stored ? JSON.parse(stored) : [];
      all = all.filter(e => e.mode !== mode);
      all = [...all, ...entries];
      localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
    } catch {
      // ignore
    }
  }, [mode]);

  // ランキング取得
  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}?mode=${mode}`);
      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();
      setLeaderboard(data.leaderboard);
      saveLocalCache(data.leaderboard);
    } catch {
      // オフライン時はローカルキャッシュを使用
      const cached = getLocalCache();
      setLeaderboard(cached);
      setError('オフラインモード: キャッシュを表示中');
    } finally {
      setIsLoading(false);
    }
  }, [mode, getLocalCache, saveLocalCache]);

  // スコア送信
  const submitScore = useCallback(async (entry: LeaderboardEntry) => {
    setIsLoading(true);

    // オプティミスティック更新
    const localEntries = getLocalCache();
    const newLocal = [...localEntries, entry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    saveLocalCache(newLocal);
    setLeaderboard(newLocal);

    if (!isOnline) {
      setError('オフライン: オンライン時に同期されます');
      setIsLoading(false);
      return { success: true, isLocal: true };
    }

    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });

      if (!res.ok) throw new Error('Failed to submit');

      const data = await res.json();
      setLeaderboard(data.leaderboard);
      saveLocalCache(data.leaderboard);
      return { success: true, isLocal: false };
    } catch {
      setError('送信失敗: ローカルに保存しました');
      return { success: true, isLocal: true };
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, getLocalCache, saveLocalCache]);

  // ランキング入り判定
  const isRankingScore = useCallback((score: number): boolean => {
    if (leaderboard.length < 10) return true;
    return score > (leaderboard[leaderboard.length - 1]?.score || 0);
  }, [leaderboard]);

  // 初回ロード
  useEffect(() => {
    setLeaderboard(getLocalCache());
    fetchLeaderboard();
  }, [mode, getLocalCache, fetchLeaderboard]);

  return {
    leaderboard,
    isLoading,
    error,
    isOnline,
    fetchLeaderboard,
    submitScore,
    isRankingScore,
  };
}
```

**オフライン対応のポイント**:
- `navigator.onLine`で接続状態を監視
- ローカルストレージにキャッシュ
- オプティミスティック更新（即座にUIに反映）
- 失敗時もローカルに保存

## Step 5: CI/CDでマイグレーション自動化

### .github/workflows/d1-migrate.yml

```yaml
name: D1 Migrate

on:
  push:
    branches: ['main']
    paths:
      - 'db/**'
  workflow_dispatch:

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: npm install -g wrangler

      - name: Run D1 Migration
        run: npx wrangler d1 execute my-game-db --remote --file=./db/schema.sql
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

**注意**: API Tokenには**D1:Edit**権限が必要です。

## 使用例：ゲームコンポーネント

```tsx
'use client';

import { useLeaderboard } from '@/hooks/useLeaderboard';

export function GameLeaderboard() {
  const {
    leaderboard,
    isLoading,
    isOnline,
    submitScore,
    isRankingScore,
  } = useLeaderboard('endless');

  const handleGameOver = async (score: number, nickname: string) => {
    if (isRankingScore(score)) {
      await submitScore({
        nickname,
        score,
        lines: 10,
        level: 5,
        date: new Date().toISOString(),
        mode: 'endless',
      });
    }
  };

  return (
    <div>
      <h2>ランキング {!isOnline && '(オフライン)'}</h2>

      {isLoading ? (
        <p>読み込み中...</p>
      ) : (
        <ol>
          {leaderboard.map((entry, i) => (
            <li key={i}>
              {entry.nickname}: {entry.score.toLocaleString()}点
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
```

## まとめ

Cloudflare D1を使えば、**完全無料**でゲームランキングを実装できます。

```
✅ 無料で永続的（停止リスクなし）
✅ SQLite互換で学習コスト低い
✅ Cloudflare Pagesと統合で簡単
✅ オフライン対応も実装可能
✅ CI/CDでマイグレーション自動化
```

SupabaseやFirebaseの無料枠制限が気になる方は、D1を試してみてください。

## 参考リンク

- [Cloudflare D1 公式ドキュメント](https://developers.cloudflare.com/d1/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/)
