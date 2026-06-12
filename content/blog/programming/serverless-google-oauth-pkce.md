---
title: "サーバーレスで Google ログインを実装する — Cloudflare Pages Functions + PKCE"
date: "2026-06-14"
publishDate: "2026-06-14"
description: "常駐サーバーなしで Google OAuth 2.0 ログインを実装する方法を解説。Authorization Code Flow + PKCE の仕組み、Cloudflare Pages Functions でのトークン交換、自前 JWT によるセッション管理まで、adalab focus の実装をベースに紹介します。"
tags: ["OAuth", "PKCE", "Google ログイン", "Cloudflare Pages", "JWT", "認証", "サーバーレス", "adalab focus"]
author: "Adabana Saki"
category: "プログラミング"
series: "adalab-focus-dev"
seriesOrder: 3
---

# サーバーレスで Google ログインを実装する — Cloudflare Pages Functions + PKCE

[adalab focus](https://study.adalabtech.com) 開発記の第 3 回です。今回は認証の話。「Google でログイン」を、**常駐サーバーなし（Cloudflare Pages Functions のみ）**で実装します。

Firebase Auth や Auth0 を使えば一瞬では？と思うかもしれません。実際それも正解です。ただ、OAuth は一度自分の手で通しておくと外部サービスのドキュメントの解像度が段違いに上がるので、個人開発こそ自前実装の価値があると思っています。

## 全体フロー

使うのは **Authorization Code Flow + PKCE** です。SPA でも安全にコード交換できるのがポイントです。

```text
【ログインフロー全体】

 ブラウザ (SPA)                Pages Functions             Google
     │                              │                        │
     │ ① code_verifier 生成          │                        │
     │    code_challenge = S256(it)  │                        │
     │                              │                        │
     │ ② 認可画面へリダイレクト ──────────────────────────────→ │
     │    (challenge を添えて)        │                        │
     │                              │                        │
     │ ③ ←─────────────── code 付きでコールバック ───────────── │
     │                              │                        │
     │ ④ code + verifier を送信 ───→ │                        │
     │                              │ ⑤ code + verifier +     │
     │                              │    client_secret で ───→ │
     │                              │    トークン交換           │
     │                              │ ⑥ ←── id_token ──────── │
     │                              │                        │
     │ ⑦ ←── 自前 JWT を発行 ─────── │                        │
     │      (以降の API はこれで認証)  │                        │
```

PKCE（Proof Key for Code Exchange）の役割は ①〜⑤ です。「認可コードを盗まれても、`code_verifier` を知らなければトークンに交換できない」という仕掛けで、リダイレクト経由でコードが漏れるリスクを潰します。

## ① PKCE の準備はブラウザだけで完結する

`code_verifier` はランダム文字列、`code_challenge` はその SHA-256 ハッシュです。Web Crypto API だけで作れます：

```typescript
function base64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function createPkce(): Promise<{ verifier: string; challenge: string }> {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const verifier = base64url(bytes.buffer);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return { verifier, challenge: base64url(digest) };
}
```

`verifier` は `sessionStorage` に置き、`challenge` だけを認可 URL に乗せて Google へ飛ばします。

```typescript
const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
url.searchParams.set('client_id', GOOGLE_CLIENT_ID);
url.searchParams.set('redirect_uri', `${location.origin}/auth/callback`);
url.searchParams.set('response_type', 'code');
url.searchParams.set('scope', 'openid email profile');
url.searchParams.set('code_challenge', challenge);
url.searchParams.set('code_challenge_method', 'S256');
location.href = url.toString();
```

## ⑤ トークン交換は Functions でやる（ここだけは譲れない）

トークン交換には `client_secret` が必要です。これをブラウザに置いた瞬間に「secret」ではなくなるので、**この 1 ステップのためだけにサーバーサイドが要ります**。Cloudflare Pages Functions なら `functions/api/auth/callback.ts` を置くだけです：

```typescript
// functions/api/auth/callback.ts (抜粋)
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const { code, verifier } = await request.json<{ code: string; verifier: string }>();

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      code_verifier: verifier,          // ← PKCE の答え合わせ
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET, // ← サーバーにしか無い
      redirect_uri: env.OAUTH_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  const tokens = await res.json<{ id_token: string }>();
  const profile = decodeIdToken(tokens.id_token); // sub / email / name
  // D1 にユーザーを upsert して、自前 JWT を返す
  // ...
};
```

シークレットは `wrangler` の環境変数（ローカルは `.dev.vars`、本番はダッシュボード）に置きます。**`.dev.vars` は必ず `.gitignore` に入れてください**。これを公開リポジトリに push する事故は本当によく見ます。

## ⑦ セッションは自前 JWT で

Google の `id_token` をそのままセッションに使うこともできますが、有効期限が 1 時間しかなく、リフレッシュ管理が面倒です。adalab focus では**ログイン成立時に自前の JWT を発行**して、以降の API はそれだけで認証しています。

```typescript
// JWT 発行 (HS256)。Web Crypto API で署名できるので外部ライブラリ不要
async function signJwt(payload: object, secret: string): Promise<string> {
  const enc = (obj: object) => base64url(new TextEncoder().encode(JSON.stringify(obj)).buffer);
  const head = enc({ alg: 'HS256', typ: 'JWT' });
  const body = enc({ ...payload, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 });
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${head}.${body}`));
  return `${head}.${body}.${base64url(sig)}`;
}
```

検証側も同じく Web Crypto だけで書けます。Workers ランタイムは Node ではないので「とりあえず `jsonwebtoken`」が使えない場面があるのですが、HS256 程度なら標準 API で十分でした。

```text
【セッション設計の比較】

  Google id_token をそのまま使う
    → 1時間で切れる。リフレッシュトークンの保管が悩ましい

  自前 JWT (採用)
    → 有効期限を自分で決められる (30日)
    → ペイロードに自アプリのユーザー ID を直接入れられる
    → Google への依存はログインの瞬間だけになる
```

## ハマりどころメモ

実装中に踏んだものを正直に書いておきます：

- **`redirect_uri` の完全一致**。Google Cloud Console の設定と 1 文字でも違うと `redirect_uri_mismatch`。`http://localhost:5173` と `http://127.0.0.1:5173` は別物です
- **時計ずれで JWT が「未来」になる**。`exp` 検証に数十秒のマージン（leeway）を入れないと、端末の時計が少し進んでいるユーザーだけログインできなくなります
- **401 時の UX**。API クライアント側で 401 を一元処理してログイン画面へ誘導しないと、画面ごとに半端な壊れ方をします

## まとめ

- SPA の Google ログインは **Authorization Code Flow + PKCE** が現在の正解
- ブラウザでやれるのは PKCE 生成まで。**トークン交換だけはサーバー（Functions）が必須**
- セッションは自前 JWT にすると Google への依存がログインの瞬間だけになる
- Workers ランタイムでは Web Crypto API が標準。HS256 の署名/検証はライブラリなしで書ける

次回は一番面白かった部分、**ポモドーロタイマーの状態設計**です。「タイマーは setInterval で作ってはいけない」という話をします。

## リンク

- [adalab focus](https://study.adalabtech.com)
- [RFC 7636 — Proof Key for Code Exchange](https://datatracker.ietf.org/doc/html/rfc7636)
- [Google Identity — OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
