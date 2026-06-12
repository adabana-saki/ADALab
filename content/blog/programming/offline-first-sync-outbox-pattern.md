---
title: "オフライン同期は Outbox パターンで作る — Dexie + Cloudflare D1 実装解説"
date: "2026-06-13"
publishDate: "2026-06-13"
description: "PWA のオフライン編集をサーバーと自動同期させる Outbox パターンの実装を解説。IndexedDB を Single Source of Truth にした設計、Last-Write-Wins による競合解決、Background Sync までの道のりを adalab focus の実例で紹介します。"
tags: ["PWA", "IndexedDB", "Dexie", "オフライン同期", "Outbox パターン", "Cloudflare D1", "TypeScript", "adalab focus"]
author: "Adabana Saki"
category: "プログラミング"
series: "adalab-focus-dev"
seriesOrder: 2
---

# オフライン同期は Outbox パターンで作る — Dexie + Cloudflare D1 実装解説

[前回の記事](/blog/adalab-focus-architecture)では、学習管理アプリ [adalab focus](https://study.adalabtech.com) の全体構成を紹介しました。今回はその心臓部、**オフライン編集を壊さずにサーバーへ同期する仕組み**の話です。

「オフライン対応」と聞くと難しそうですが、構造を 1 つ決めてしまえば後は機械的に作れます。それが **Outbox パターン**です。

## 素朴な実装はどこで壊れるか

まず、やりがちな失敗から：

```typescript
// ❌ 素朴な実装
async function addTask(input: TaskInput) {
  const task = await api.post('/api/tasks', input); // サーバーに作ってもらう
  setTasks([...tasks, task]);                       // 返ってきたら画面に反映
}
```

これはオフラインで即死しますし、オンラインでも電波が弱いと「ボタンを押したのに何も起きない」アプリになります。

「じゃあ失敗したらローカルに貯めて後で送ろう」と継ぎ足すと、今度は**成功パスと失敗パスでデータの流れが 2 本**になり、エッジケースの泥沼が始まります。

## Outbox パターン：流れを 1 本にする

Outbox パターンの本質は、**オンラインでもオフラインでも全く同じコードパスを通す**ことです。

```text
【Outbox パターンのデータフロー】

  ユーザー操作
      │
      ↓
  ┌──────────────┐
  │  IndexedDB    │ ← ① まずローカルに書く（これで操作は「完了」）
  │  (tasks etc.) │
  └──────┬───────┘
         │
         ↓
  ┌──────────────┐
  │   outbox      │ ← ② 「何をしたか」をキューに記録
  │  (送信待ち)    │
  └──────┬───────┘
         │  ③ オンラインなら即 flush
         │     オフラインなら復帰時に flush
         ↓
  ┌──────────────┐
  │  Cloudflare   │
  │  D1 (サーバー) │
  └──────────────┘
```

オフラインかどうかは ③ のタイミングが変わるだけで、①② は常に同じです。分岐がないのでバグが入る隙間もありません。

## 実装：outbox テーブル

Dexie のスキーマに送信待ちキューを 1 テーブル足します：

```typescript
// db/schema.ts (抜粋)
db.version(N).stores({
  tasks: 'id, user_id, [user_id+status]',
  sessions: 'id, user_id, [user_id+started_at]',
  // 送信待ちキュー。++id で投入順を保証
  outbox: '++seq, created_at',
});

interface OutboxEntry {
  seq?: number;
  table: 'tasks' | 'sessions' | 'subjects' | 'exams';
  op: 'upsert' | 'delete';
  data: Record<string, unknown>;
  created_at: number;
}
```

書き込み系の関数は全部この 2 行セットで終わります：

```typescript
await db.tasks.put(task);
await enqueueOutbox({ table: 'tasks', op: 'upsert', data: task });
```

## flush：キューを順番に流す

flush は「キューの先頭から順にサーバーへ送り、成功したら消す」だけです。ただし**多重実行の防止**だけは必須です（オンライン復帰イベントと定期実行が重なるため）：

```typescript
let flushing = false;

export async function flushOutbox(): Promise<void> {
  if (flushing || !navigator.onLine) return;
  flushing = true;
  try {
    // 投入順に処理（順序が変わると delete → upsert の逆転事故が起きる）
    const entries = await db.outbox.orderBy('seq').toArray();
    for (const e of entries) {
      await api(`/api/sync`, { method: 'POST', body: JSON.stringify(e) });
      await db.outbox.delete(e.seq!); // 成功したものだけ消す
    }
  } catch {
    // 失敗したら何もしない。次の flush で先頭から再試行される
  } finally {
    flushing = false;
  }
}

// 発火タイミングは 3 つ
window.addEventListener('online', () => void flushOutbox());
setInterval(() => void flushOutbox(), 30_000);
// + 書き込み直後にも void flushOutbox()
```

重要なのは**失敗時に何も特別なことをしない**ことです。キューに残っているものは「まだ送れていないもの」であり、次の機会に先頭から再試行されます。リトライロジックを書かないことがリトライロジックになっています。

## 競合解決：Last-Write-Wins で十分

PC とスマホで同じタスクを編集したら？という問題には、全レコードに `updated_at`（ミリ秒タイムスタンプ）を持たせて **Last-Write-Wins（後勝ち）** で解決しています。

```sql
-- D1 側 (Pages Function 内)。新しい updated_at のときだけ上書き
INSERT INTO tasks (...) VALUES (...)
ON CONFLICT(id) DO UPDATE SET
  title = excluded.title,
  status = excluded.status,
  updated_at = excluded.updated_at
WHERE excluded.updated_at > tasks.updated_at;
```

CRDT のような本格的な競合解決も検討しましたが、採用しませんでした。理由は単純で、**学習管理アプリは 1 ユーザー = 1 人**だからです。自分が PC とスマホで同じタスクのタイトルを同時に書き換える状況はまず起きず、起きたとしても「最後に編集した方が残る」は直感に反しません。

```text
【競合解決の選び方（私見）】

  共同編集エディタ        → CRDT / OT が必要
  チームのカンバン        → フィールド単位のマージくらいは欲しい
  個人用ツール (1人=1垢)  → Last-Write-Wins で実用上困らない ← adalab focus はここ
```

道具は問題のサイズに合わせるのが大事です。

## 削除は「物理削除しない」

同期があるアプリでは、レコードの物理削除は事故のもとです。端末 A で削除 → 端末 B がオフライン編集 → B が同期、で**削除したはずのタスクが復活**します（ゾンビ問題）。

そこで削除はすべて論理削除にしました：

```typescript
// deleted フラグを立てるだけ。あとは通常の upsert と同じ経路で同期される
task.deleted = 1;
task.updated_at = Date.now();
await db.tasks.put(task);
await enqueueOutbox({ table: 'tasks', op: 'upsert', data: task });
```

「削除」を「更新の一種」に潰してしまえば、Last-Write-Wins がそのまま削除の競合も解決してくれます。ゾンビは `updated_at` の比較で自然に消えます。

## 画面は useLiveQuery で勝手についてくる

同期で IndexedDB が書き換わったとき、画面の更新コードは 1 行も書いていません。Dexie の `useLiveQuery` が IndexedDB の変更を購読しているからです：

```tsx
const tasks = useLiveQuery(
  () => db.tasks
    .where('user_id').equals(userId)
    .filter((t) => t.deleted === 0)
    .toArray(),
  [userId],
);
```

「同期処理」と「画面更新」が完全に分離されているので、同期側はデータのことだけ考えればよくなります。この分離は精神衛生に非常によいです。

## まとめ

| 設計判断 | 効果 |
|---------|------|
| 書き込みは常に IndexedDB → outbox | オンライン/オフラインでコードパスが同じ |
| flush は先頭から・失敗したら放置 | リトライを書かずにリトライが手に入る |
| Last-Write-Wins + updated_at | 個人用アプリには必要十分な競合解決 |
| 削除は論理削除 | ゾンビ復活問題を upsert に統一して解決 |
| useLiveQuery で購読 | 同期と画面更新の完全分離 |

次回はログイン編です。**サーバーを持たずに Google OAuth (PKCE) を実装する**話を書きます。

## リンク

- [adalab focus](https://study.adalabtech.com)
- [Dexie liveQuery のドキュメント](https://dexie.org/docs/liveQuery())
