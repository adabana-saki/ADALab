---
title: "月額0円で動く学習管理アプリを個人開発した話 — React PWA + Cloudflare 構成のすべて"
date: "2026-06-12"
publishDate: "2026-06-12"
description: "TODO・ポモドーロ・学習統計を統合した PWA「adalab focus」の技術構成を解説。React 19 + Vite + Dexie のローカルファースト設計と、Cloudflare Pages Functions + D1 によるサーバーレス同期で、運用コストゼロを実現した方法を紹介します。"
tags: ["React", "PWA", "Cloudflare Pages", "Cloudflare D1", "IndexedDB", "TypeScript", "個人開発", "adalab focus"]
author: "Adabana Saki"
category: "プログラミング"
series: "adalab-focus-dev"
seriesOrder: 1
---

# 月額0円で動く学習管理アプリを個人開発した話 — React PWA + Cloudflare 構成のすべて

学習管理アプリ「[adalab focus](https://study.adalabtech.com)」を公開しました。TODO・ポモドーロタイマー・学習記録・統計・試験カウントダウンを 1 つの画面に統合した、いわば「勉強専用の TickTick」のようなアプリです。

この記事から数回に分けて、開発で得た技術的な知見をシリーズとして書いていきます。第 1 回はアーキテクチャ全体の話です。

## 個人開発アプリに課した3つの条件

作り始める前に、自分の中で譲れない条件を決めました：

```text
【adalab focus の設計条件】

1. オフラインで完全動作する
   → 電車の中・図書館の地下でも勉強記録は止められない

2. PC とスマホで自動同期する
   → 机では PC、移動中はスマホ。手動エクスポートはしたくない

3. 運用コストは月額 0 円
   → 個人開発は「サーバー代が惜しくなって終わる」のが定番の死因
```

1 と 2 は普通に考えると矛盾します。オフライン動作はデータを端末に置くことを要求し、同期はデータをサーバーに置くことを要求するからです。これを両立させるのが**ローカルファースト**という設計です。

## 全体アーキテクチャ

```text
【システム構成】

  ブラウザ (PC / スマホ PWA)
  ┌─────────────────────────────────┐
  │  React 19 + Vite + Tailwind v4  │
  │                                 │
  │  ┌───────────┐   ┌───────────┐  │
  │  │  zustand  │   │   Dexie   │  │
  │  │ (UI状態)  │   │(IndexedDB)│←─┼── ここが Single Source of Truth
  │  └───────────┘   └─────┬─────┘  │
  │                        │        │
  │                  ┌─────┴─────┐  │
  │                  │  Outbox   │  │ ← オフライン中の変更を貯める
  │                  └─────┬─────┘  │
  └────────────────────────┼────────┘
                           │ オンライン時に flush
                           ↓
  ┌─────────────────────────────────┐
  │   Cloudflare Pages Functions    │ ← API (サーバーレス)
  │   + D1 (SQLite at the edge)     │ ← 同期用 DB
  └─────────────────────────────────┘
```

ポイントは、**アプリは常に IndexedDB だけを見て動く**ことです。画面の描画にサーバーは一切関与しません。サーバーは「他の端末との合流地点」でしかなく、落ちていてもアプリは普通に使えます。

## 技術選定の理由

| 技術 | 役割 | 選んだ理由 |
|------|------|-----------|
| React 19 + Vite | UI | HMR が速い。素の SPA で十分（SSR 不要） |
| Tailwind CSS v4 | スタイル | デザインシステムを CSS 変数で一元管理 |
| zustand | UI 状態 | タイマーなど「DB に置かない状態」専用 |
| Dexie | データ層 | IndexedDB の薄いラッパー。`useLiveQuery` が強力 |
| Cloudflare Pages | ホスティング | 静的配信 + Functions が同居。無料枠が広い |
| Cloudflare D1 | 同期 DB | SQLite 互換。無料枠 500 万行読み取り/日 |

### SSR を捨てた判断

Next.js も検討しましたが、採用しませんでした。学習管理アプリは**ログイン後の自分専用画面**しかなく、SEO もファーストビューの速度も問題になりません。それよりも「Service Worker でアプリ全体をキャッシュして、2 回目以降はネットワークゼロで起動する」方が体験に効きます。

PWA 化は `vite-plugin-pwa` でほぼ設定だけです：

```typescript
// vite.config.ts (抜粋)
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
  },
  manifest: {
    name: 'adalab focus',
    display: 'standalone',
    theme_color: '#0a0a12',
    // ...
  },
})
```

スマホでは「ホーム画面に追加」するとネイティブアプリのように全画面で起動します。

## データの流れ：書き込みは常にローカルへ

タスク追加を例にすると、処理は徹底して「ローカル完結 + 後送り」です：

```typescript
// タスク追加の流れ (簡略化)
export async function addTask(userId: string, input: TaskInput): Promise<Task> {
  const task = { id: ulid(), user_id: userId, ...input, updated_at: Date.now() };

  await db.tasks.add(task);                                   // 1. IndexedDB に即書き込み
  await enqueueOutbox({ table: 'tasks', op: 'upsert', data: task }); // 2. 送信待ちキューに積む
  void flushOutbox();                                         // 3. オンラインなら即送信 (失敗しても OK)

  return task;
}
```

UI 側は Dexie の `useLiveQuery` で IndexedDB を購読しているので、`db.tasks.add` した瞬間に画面が更新されます。サーバーへの送信が成功したかどうかは UI と無関係です。

```tsx
// 画面側: IndexedDB を直接「購読」する
const tasks = useLiveQuery(
  () => db.tasks.where('user_id').equals(userId).toArray(),
  [userId],
);
```

この構成の気持ちよさは、**「ローディング中…」がほぼ存在しない**ことです。データは常に手元にあるので、画面遷移は全部一瞬で終わります。

## ID は ULID にする

複数端末がオフラインで同時にデータを作る以上、ID はクライアント側で生成する必要があります。UUID でもよいのですが、**ULID**（時系列ソート可能な一意 ID）を使いました。

```text
【ULID の構造】

 01HV3X5P7Q  ABCDEF123456789
 └────┬────┘ └──────┬───────┘
   タイムスタンプ      ランダム
   (ミリ秒精度)

→ ID でソートすると自動的に作成順になる
→ DB のインデックスとも相性がよい
```

「作成順に並べたい」はアプリのあらゆる場所で出てくるので、ID 自体がソートキーになるのは地味に効きます。

## 運用コストの実際

公開から現在までの請求額は **0 円**です。

| サービス | 無料枠 | 実際の使用量 |
|---------|--------|-------------|
| Cloudflare Pages | ビルド 500 回/月 | 1 日数回 |
| Pages Functions | 10 万リクエスト/日 | 数百〜数千/日 |
| D1 | 500 万行読み取り/日 | 数千行/日 |

ローカルファースト設計のおかげで API リクエスト自体が少ない（同期時しか飛ばない）ので、無料枠を使い切る未来がそもそも見えません。個人開発との相性は抜群だと思います。

## まとめ

- ローカルファースト（IndexedDB が主、サーバーは従）にすると、オフライン動作・同期・速度の 3 つが同時に手に入る
- ログイン後専用の SPA に SSR は不要。PWA キャッシュの方が体験に効く
- Cloudflare Pages + Functions + D1 は個人開発の無料枠として現状最強クラス

次回は、この構成の心臓部である **Outbox パターンによるオフライン同期**の実装を詳しく解説します。「オフラインで編集 → オンライン復帰で自動同期」を、どうやって壊れないように作るかという話です。

## リンク

- [adalab focus](https://study.adalabtech.com) — 今回作ったアプリ（無料で使えます）
- [Dexie.js](https://dexie.org/) — IndexedDB ラッパー
- [Cloudflare D1](https://developers.cloudflare.com/d1/) — エッジ SQLite
