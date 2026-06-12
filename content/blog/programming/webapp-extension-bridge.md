---
title: "Web アプリとブラウザ拡張を連携させる — postMessage ブリッジと declarativeNetRequest"
date: "2026-06-16"
publishDate: "2026-06-16"
description: "学習アプリのポモドーロと連動して、フォーカス中だけ誘惑サイトをブロックする拡張機能「adalab shield」の連携設計を解説。postMessage によるプロトコル設計、なりすまし対策、declarativeNetRequest でのページ読み込み前ブロックを紹介します。"
tags: ["Chrome 拡張", "Manifest V3", "declarativeNetRequest", "postMessage", "content script", "TypeScript", "adalab shield", "adalab focus"]
author: "Adabana Saki"
category: "プログラミング"
series: "adalab-focus-dev"
seriesOrder: 5
---

# Web アプリとブラウザ拡張を連携させる — postMessage ブリッジと declarativeNetRequest

[adalab focus](https://study.adalabtech.com) 開発記、最終回です。

ポモドーロで「25 分集中する」と決めても、YouTube は同じブラウザの隣のタブにいます。意志力で勝てないなら仕組みで勝とう、ということで作ったのが拡張機能 **[adalab shield](https://github.com/adabana-saki/adalab-shield)** です。

- フォーカス開始 → 誘惑サイト（YouTube・TikTok など）を自動ブロック
- 休憩開始 → 自動で解除
- ブロック画面には「フォーカスの残り時間」と「いま取り組んでいるタスク名」を表示

今回はこの **Web アプリ ↔ 拡張機能のリアルタイム連携**をどう設計したかを書きます。

## 連携の全体像

Web ページと拡張機能は直接は話せません。間に立てるのが content script です。

```text
【連携アーキテクチャ】

  adalab focus (Webページ)
      │
      │ window.postMessage           ← ページと content script の境界
      ↓
  content script (adalabBridge)
      │
      │ browser.runtime.sendMessage  ← 拡張内部のメッセージング
      ↓
  background (service worker)
      │
      │ ポモドーロ状態を保存 → ブロックルールを再計算
      ↓
  declarativeNetRequest              ← ネットワーク層でブロック
```

Web アプリ側はタイマー状態が変わるたびに `postMessage` を投げるだけです：

```typescript
// adalab focus 側。拡張が入っていなければ誰も聞いていないだけ (無害)
window.postMessage({
  source: 'adalab-study',
  type: 'timer-sync',
  payload: {
    phase: 'work',            // work | short_break | long_break | idle
    running: true,
    endTime: 1781229600000,   // このフォーカスが終わる時刻 (epoch ms)
    taskTitle: '過去問 2023', // ブロック画面に表示する
  },
}, window.location.origin);
```

この「**拡張が無くても何も壊れない**」という性質が postMessage 連携の良いところです。アプリは拡張の存在を仮定せず、ただ状態を放送し続けます。

## postMessage は「誰でも投げられる」前提で受ける

content script 側の受信には注意が要ります。`window.postMessage` は**ページ上の任意のスクリプトが投げられる**ので、性悪説で検証します：

```typescript
// content script (adalabBridge) 側
window.addEventListener('message', (event) => {
  if (event.source !== window) return;          // 自ウィンドウ以外は無視
  if (!isAdalabHost(location.hostname)) return; // 許可ホストでのみ動く

  const d = event.data;
  if (d?.source !== 'adalab-study' || d?.type !== 'timer-sync') return;

  const payload = parsePayload(d.payload);      // 型・値域を 1 つずつ検証
  if (!payload) return;
  void browser.runtime.sendMessage({ type: 'ADALAB_SYNC', payload });
});

// content script 自体も許可ホストにしか注入しない (manifest の matches +念のための二重チェック)
function isAdalabHost(hostname: string): boolean {
  if (hostname === 'study.adalabtech.com') return true;
  // localhost は開発用ポート (5173) だけ許可
  return (hostname === 'localhost' || hostname === '127.0.0.1') && location.port === '5173';
}
```

`parsePayload` では `phase` が既知の値か、`endTime` が数値か、`taskTitle` が 200 文字以内か、まで見ています。タスク名はブロック画面に表示される文字列なので、長さ制限は表示崩れ対策と注入対策を兼ねます。

## ブロックは JS ではなくネットワーク層で

「ブロック」を content script で `document.body` を覆って実現する拡張も多いのですが、それだと**ページの読み込み自体は走る**ので、一瞬サムネイルが見えたり、音が鳴り始めたりします。誘惑のブロックとしては致命的です。

Manifest V3 の **declarativeNetRequest (DNR)** を使うと、リクエストの段階でリダイレクトできます：

```typescript
// background 側。フォーカス開始時に動的ルールを登録する
await browser.declarativeNetRequest.updateDynamicRules({
  addRules: [{
    id: FULLSITE_RULE_BASE + index, // サイトごとに採番
    priority: 1,
    condition: {
      regexFilter: '^https?://([^/]*\\.)?youtube\\.com(/.*)?$',
      resourceTypes: ['main_frame'],
    },
    action: {
      type: 'redirect',
      redirect: {
        // \0 はマッチした元 URL。休憩になったら自動で戻すために渡す
        regexSubstitution: browser.runtime.getURL('blocked.html') + '?p=youtube&u=\\0',
      },
    },
  }],
  removeRuleIds: [/* 古いルール */],
});
```

```text
【content script ブロック vs DNR ブロック】

  content script 方式:
    リクエスト → HTML 取得 → JS/動画の読み込み開始 → 覆い被せる
                              └─ ここまでに誘惑は始まっている

  DNR 方式 (採用):
    リクエスト → その場でブロックページへリダイレクト
    → 元ページのバイトは 1 つも届かない
```

休憩フェーズに入ったら動的ルールを全削除すれば解除完了です。さらにブロックページ側の JS が「休憩が始まったか」を監視していて、始まった瞬間に `?u=` で渡された元 URL へ自動で戻します。ブロックは厳しく、復帰はシームレスに、です。

## ブロック画面に「あと何分か」を出す

ただ「ブロックしました」と言われるより、**「あと 12 分で休憩です。いまは『過去問 2023』の時間」**と言われる方が、人は納得して戻れます。

postMessage で受け取った `endTime` と `taskTitle` は拡張のストレージに入っているので、ブロックページはそれを読んでカウントダウンを表示するだけです。タイマー本体と通信し続ける必要はありません。`endTime` という**絶対時刻**を渡しているからで、ここでも前回の「タイムスタンプ方式」が効いています。

## 逆方向：拡張のポップアップからタイマーを操作する

連携は逆方向もあります。拡張のポップアップから「タイマー開始」「タスク完了」を押せるリモコン機能です。経路はさっきの逆再生ですが、**リクエスト/レスポンスの対応付け**が必要になるので `requestId` を発行しています：

```typescript
// content script → ページ
const requestId = crypto.randomUUID();
window.postMessage({ source: 'shortshield', type: 'command', requestId, action: 'timer-start' }, origin);

// ページ → content script (実行結果を同じ requestId で返す)
window.postMessage({ source: 'adalab-study', type: 'command-result', requestId, ok: true, payload }, origin);
```

postMessage には「返事」という概念がないので、相関 ID と 3 秒のタイムアウトを自前で持つ、古典的な RPC の再発明です。地味ですが、これがないと「押したのに何も起きない（ように見える）」ポップアップになります。

## E2E テストは「拡張を実際に読み込んで」やる

この連携、ユニットテストだけでは守れません。manifest の `matches` 設定ミス 1 つで全部沈黙するからです。Playwright は拡張を読み込んだ Chromium を起動できるので、E2E で本物の流れを通しています：

```typescript
const context = await chromium.launchPersistentContext('', {
  args: [
    `--disable-extensions-except=${EXT_PATH}`,
    `--load-extension=${EXT_PATH}`,
  ],
});
// 実ページで postMessage → DNR ルール登録 → ブロックページへの
// リダイレクトまでを 1 本のテストで確認する
```

「フォーカス開始したら example.com がブロックページにリダイレクトされる」が CI で毎回検証されるのは、かなりの安心感があります。

## まとめ

| 設計判断 | 理由 |
|---------|------|
| 連携は postMessage の一方的な放送 | 拡張が無くても何も壊れない疎結合 |
| 受信側は送信元・型・値域を全部検証 | postMessage はページ上の誰でも投げられる |
| ブロックは DNR でネットワーク層 | 誘惑コンテンツのバイトを 1 つも届かせない |
| `endTime` は絶対時刻で渡す | 受け取った側が通信なしでカウントダウンできる |
| E2E は拡張を実機読み込み | manifest 設定ミスはユニットテストで捕まらない |

これで adalab focus 開発記シリーズは完結です。アプリも拡張も実際に動くものが公開されているので、興味があれば触ってみてください。

## リンク

- [adalab focus](https://study.adalabtech.com) — 学習管理 PWA
- [adalab shield (GitHub)](https://github.com/adabana-saki/adalab-shield) — 今回の拡張機能
- [declarativeNetRequest — Chrome for Developers](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest)
