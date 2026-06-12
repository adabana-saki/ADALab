---
title: "ポモドーロタイマーを setInterval で作ってはいけない — タイムスタンプ方式の状態設計"
date: "2026-06-15"
publishDate: "2026-06-15"
description: "Web アプリのタイマーをカウントダウン変数で実装すると、タブのバックグラウンド化やリロードで簡単に壊れます。「開始時刻だけを持ち、残り時間は毎回計算する」タイムスタンプ方式の設計と、複数タブ同期・リロード復元の実装を adalab focus の実例で解説します。"
tags: ["JavaScript", "TypeScript", "タイマー", "ポモドーロ", "zustand", "状態管理", "PWA", "adalab focus"]
author: "Adabana Saki"
category: "プログラミング"
series: "adalab-focus-dev"
seriesOrder: 4
---

# ポモドーロタイマーを setInterval で作ってはいけない — タイムスタンプ方式の状態設計

[adalab focus](https://study.adalabtech.com) 開発記の第 4 回。今回はポモドーロタイマーの実装です。

「25 分のカウントダウンなんて `setInterval` で 1 秒ずつ引くだけでは？」と思った方にこそ読んでほしい記事です。私も最初はそう思っていましたが、その実装は**ブラウザの現実**の前に必ず壊れます。

## カウントダウン変数方式が壊れる3つの現実

```typescript
// ❌ 素朴な実装
let remaining = 25 * 60;
setInterval(() => {
  remaining -= 1;
  render(remaining);
}, 1000);
```

これが壊れる理由：

```text
【ブラウザの現実】

1. バックグラウンドタブのタイマーは間引かれる
   → Chrome は非アクティブタブの setInterval を最低 1 分間隔まで遅延させる
   → 「25 分のはずが 40 分経っても鳴らない」が普通に起きる

2. リロード・タブ閉じで変数は消える
   → 集中の途中で誤リロード → タイマー消滅

3. PC のスリープ
   → スリープ中は JS が一切動かない。復帰後の remaining は嘘の値
```

つまり「経過時間を変数に貯める」方式は、**JS が止まらないこと**を前提にしています。その前提はブラウザでは成立しません。

## タイムスタンプ方式：状態は「いつ始めたか」だけ

発想を逆転させます。**残り時間は状態ではなく、毎回計算する派生値**にするのです。

```typescript
// タイマーの状態。「現在の残り秒」はどこにも持たない
interface TimerSnapshot {
  phase: 'work' | 'short_break' | 'long_break';
  running: boolean;
  startedAt: number | null;     // 開始時刻 (epoch ms)
  pausedAt: number | null;      // 一時停止した時刻
  elapsedBeforePause: number;   // 一時停止までに消化した時間 (ms)
}
```

残り時間は「今何時か」を入れて計算します：

```typescript
function elapsedMs(snap: TimerSnapshot, now: number): number {
  if (!snap.startedAt) return snap.elapsedBeforePause;
  const base = snap.pausedAt ?? now;  // 停止中は pausedAt で時が止まる
  return snap.elapsedBeforePause + (base - snap.startedAt);
}

function remainingMs(snap: TimerSnapshot, cfg: Config, now: number): number {
  const total = durationMs(snap, cfg);
  return Math.min(total, Math.max(0, total - elapsedMs(snap, now)));
}
```

`setInterval` の役割は**再描画のトリガーだけ**になります。間引かれようがスリープしようが、次に動いた瞬間に `Date.now()` から正しい残り時間が出てきます。

```tsx
// UI 側。interval は「now を更新するだけ」
const [now, setNow] = useState(() => Date.now());
useEffect(() => {
  const id = setInterval(() => setNow(Date.now()), 1000);
  return () => clearInterval(id);
}, []);

const rem = remainingMs(snap, config, now); // ← 常に計算で導出
```

```text
【方式の比較】

  カウントダウン変数方式          タイムスタンプ方式
  ┌───────────────┐          ┌───────────────┐
  │ remaining: 873 │          │ startedAt:     │
  │ (信じるしかない) │          │  1781221787774 │
  └───────────────┘          └───────┬───────┘
   interval が止まると嘘になる         │ + Date.now()
                                     ↓
                              remaining は毎回正しく再計算
```

副産物として、**リロード復元がタダで手に入ります**。`startedAt` を localStorage に保存しておけば、リロード後も「開始時刻と今の差」から正確な残り時間が復元できるからです。

## 落とし穴①：復元した瞬間にアラームが鳴る

ここからは実際に踏んだバグの話です。タイマー実行中にタブを閉じ、数時間後に開き直すと——**開いた瞬間にアラームが鳴ります**。

原因は素直で、復元した状態の残り時間を計算すると 0 になっており、「完了監視」がそれを検知してしまうのです。さらにうちのタイマーには自動サイクル機能（作業→休憩→作業を自動で回す）があったので、放置すると**永遠に鳴り続けるアプリ**が完成していました。

対策は「**アプリを閉じている間に終わったタイマーは、音を鳴らさず静かに精算する**」です。復元時に判定を 1 つ挟みます：

```typescript
function loadPersisted(): PersistedTimer | null {
  const p = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
  if (!p) return null;

  // 閉じている間に期限が切れていたら、無音で「完了済み・停止」に整える
  if (p.snap.running && remainingMs(p.snap, p.config, Date.now()) <= 0) {
    const finishedWork = p.snap.phase === 'work';
    p.snap = {
      ...initialSnapshot,
      phase: finishedWork ? nextPhase(p.snap, p.config) : 'work',
      completedPomodoros: p.snap.completedPomodoros + (finishedWork ? 1 : 0),
    };
  }
  return p;
}
```

アラームというのは「完了の瞬間に立ち会っている人」のためのものです。閉じている間の完了は、もう過去の出来事として処理する方が正しい挙動でした。

## 落とし穴②：PWA + ブラウザタブで二重に鳴る

adalab focus は PWA なので、「インストールしたアプリ」と「普通のタブ」を同時に開けてしまいます。すると**それぞれが独立したタイマーを持ち、アラームが 2 回鳴り、学習記録も 2 重に保存される**という事故が起きました。

対策は 2 段構えです。

**1. storage イベントでタブ間の状態を同期する**

localStorage への書き込みは他のタブに `storage` イベントとして届きます。これでタイマー状態を全タブで 1 つに保ちます：

```typescript
window.addEventListener('storage', (e) => {
  if (e.key !== STORAGE_KEY || !e.newValue) return;
  const p = JSON.parse(e.newValue);
  useTimer.setState({ snap: p.snap, config: p.config }); // 他タブの操作を反映
});
```

**2. 完了処理はロックを取ったタブだけが行う**

状態が同期されると、今度は全タブが同時に「残り 0 秒」を検知します。完了処理（アラーム・記録）は localStorage を簡易ロックにして早い者勝ちにしました：

```typescript
const lockValue = `${snap.phase}_${snap.startedAt}`; // この完了イベントの ID
if (localStorage.getItem(COMPLETION_LOCK_KEY) === lockValue) return; // 他タブが処理済み
localStorage.setItem(COMPLETION_LOCK_KEY, lockValue);
// → このタブだけがアラームを鳴らし、セッションを記録する
```

`phase + startedAt` の組がイベントの一意 ID になっているのがポイントです。同じ完了を 2 つのタブが処理することはなくなります。

## 落とし穴③：自動サイクルは「無人運転」を検知して止める

自動サイクル（作業完了→休憩を自動開始→また作業…）は便利ですが、ユーザーがアプリを忘れて離席すると**誰もいない部屋で 30 分おきに鳴り続けます**。

これは技術というより設計の問題で、「最後にユーザーが操作した時刻」を持っておき、長時間無操作のままサイクルが回り続けていたら自動進行を止めるようにしました：

```typescript
const idleMs = Date.now() - lastActivityRef.current;       // pointerdown/keydown で更新
const cycleMs = (config.work_minutes + config.short_break) * 60_000;
const allowAuto = idleMs < Math.max(cycleMs * 3, 90 * 60_000); // 約3サイクル無操作で停止
const result = complete(allowAuto);
```

タイマーづくりの後半戦は、アルゴリズムではなく**「人間はアプリを閉じるし、忘れるし、2 つ開く」という前提**との戦いでした。

## まとめ

| 原則 | 理由 |
|------|------|
| 残り時間は持たない。開始時刻から毎回計算 | interval の間引き・スリープに耐える |
| setInterval は再描画のトリガーに過ぎない | 止まっても状態が壊れない |
| 閉じている間の完了は無音で精算 | 起動した瞬間に鳴るアラームは誰も求めていない |
| タブ間は storage イベントで同期 + 完了はロックで1回 | PWA とタブの同時起動に耐える |
| 無人の自動サイクルは止める | アプリは忘れられるものとして設計する |

次回は最終回、**Web アプリとブラウザ拡張機能の連携**です。フォーカス中だけ YouTube をブロックする拡張「adalab shield」と、postMessage プロトコルでつないだ話を書きます。

## リンク

- [adalab focus](https://study.adalabtech.com)
- [MDN — Page Visibility API](https://developer.mozilla.org/ja/docs/Web/API/Page_Visibility_API)
- [Chrome のタイマースロットリング仕様](https://developer.chrome.com/blog/timer-throttling-in-chrome-88)
