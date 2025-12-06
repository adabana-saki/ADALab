---
title: "【完全版】Dockerコマンドチートシート2025｜これだけ覚えれば現場で困らない"
date: "2025-12-07"
publishDate: "2025-12-10"
description: "Docker初心者から中級者向けに、実務で本当に使うDockerコマンドを徹底解説。コンテナ・イメージ操作からDocker Composeまで網羅。"
tags: ["Docker", "コンテナ", "チートシート", "開発環境", "DevOps"]
author: "Adabana Saki"
---

# Dockerコマンドチートシート2025

「Dockerコマンドが多すぎて覚えられない...」
「毎回ググってしまう...」

正直、私も最初はそうでした。docker run のオプションだけで何十個もあって、頭がパンクしそうになったのを覚えています。

でも安心してください。**現場で本当に使うコマンドは、実はそんなに多くない**んです。

この記事では、Docker歴5年の経験から「これさえ押さえておけば困らない」コマンドを厳選してまとめました。ブックマークしておくと、いつでも見返せて便利ですよ。

## Dockerって結局何なの？

**Docker（ドッカー）は「どこでも同じ環境を再現できる箱」** です。

開発者なら一度は経験があるはず。「自分のPCでは動くのに、サーバーにデプロイしたら動かない」「新人が環境構築で3日潰れた」といった問題。Dockerを使えば、これらが劇的に減ります。

```
【Dockerがない世界】

開発者A: 「私のPCでは動くよ？」
開発者B: 「え、僕のでは動かないんだけど...」
本番環境: 「なんかエラー出てますけど」
新人:     「環境構築で1週間経ちました...」

【Dockerがある世界】

docker run → 誰でも同じ環境が5分で立ち上がる 🎉
```

### イメージとコンテナの関係

Dockerを理解する上で、この2つの違いは押さえておきましょう。

| 概念 | 例え | 説明 |
|------|------|------|
| **イメージ** | レシピ・設計図 | アプリと動作環境の「ひな形」 |
| **コンテナ** | 料理・製品 | イメージから作られた「実体」 |

```
【関係性】

イメージ（設計図）         コンテナ（実体）
┌─────────────────┐       ┌─────────────────┐
│   nginx:latest   │ ────→ │   Webサーバー1   │
│                  │       └─────────────────┘
│                  │ ────→ ┌─────────────────┐
│                  │       │   Webサーバー2   │
└─────────────────┘       └─────────────────┘
                          同じイメージから複数作れる
```

1つのイメージから、何個でもコンテナを作れます。これが「どこでも同じ環境」を実現する仕組みです。

## 2025年のDocker事情

### Docker Desktop の進化

2025年、Docker Desktopは大きく進化しています。

- **リリース頻度が2週間ごとに** - 以前は月1回だったのが、より頻繁にアップデート
- **AI機能の統合** - Docker Model Runnerが正式リリースされ、ローカルでLLMを動かせるように
- **セキュリティ強化** - Enhanced Container Isolation（強化されたコンテナ分離）が追加

### docker-compose から docker compose へ

**2023年以降、`docker-compose` は非推奨になりました。** これからは `docker compose`（ハイフンなし）を使いましょう。

```bash
# 旧コマンド（非推奨）
docker-compose up -d

# 新コマンド（推奨）
docker compose up -d
```

Docker Desktopを最新版にしていれば、どちらでも動きますが、新しい方で覚えておくのがベストです。

## まず覚える7つのコマンド

いきなり全部覚えなくて大丈夫。この7つで日常業務の9割はカバーできます。

| コマンド | 何をする | いつ使う |
|----------|----------|----------|
| `docker run` | コンテナを作って起動 | 新しく始めるとき |
| `docker ps` | 動いてるコンテナ一覧 | 状況確認 |
| `docker stop` | コンテナを止める | 作業終了時 |
| `docker start` | コンテナを再開 | 作業再開時 |
| `docker logs` | ログを見る | エラー調査 |
| `docker exec` | コンテナに入る | 中を調べたいとき |
| `docker rm` | コンテナを削除 | 不要になったとき |

これだけ。本当にこれだけで、まずは十分やっていけます。

## 状況別チートシート

### イメージ操作

| やりたいこと | コマンド |
|------------|---------|
| イメージを検索 | `docker search nginx` |
| イメージをダウンロード | `docker pull nginx` |
| イメージ一覧を見る | `docker images` |
| イメージを削除 | `docker rmi nginx` |
| 使ってないイメージを一括削除 | `docker image prune` |
| Dockerfileからビルド | `docker build -t myapp .` |

### コンテナ操作

| やりたいこと | コマンド |
|------------|---------|
| コンテナを作って起動 | `docker run nginx` |
| バックグラウンドで起動 | `docker run -d nginx` |
| 名前をつけて起動 | `docker run -d --name web nginx` |
| ポートを公開して起動 | `docker run -d -p 8080:80 nginx` |
| 動いてるコンテナ一覧 | `docker ps` |
| 全コンテナ一覧（停止中含む） | `docker ps -a` |
| コンテナを停止 | `docker stop web` |
| コンテナを再開 | `docker start web` |
| コンテナを削除 | `docker rm web` |
| 停止中のコンテナを一括削除 | `docker container prune` |

### コンテナ調査

| やりたいこと | コマンド |
|------------|---------|
| ログを見る | `docker logs web` |
| ログをリアルタイムで見る | `docker logs -f web` |
| コンテナに入る（bash） | `docker exec -it web bash` |
| コンテナに入る（sh） | `docker exec -it web sh` |
| コンテナの詳細を見る | `docker inspect web` |
| リソース使用状況を見る | `docker stats` |

### ファイル操作

| やりたいこと | コマンド |
|------------|---------|
| ホスト→コンテナにコピー | `docker cp ./file.txt web:/app/` |
| コンテナ→ホストにコピー | `docker cp web:/app/file.txt ./` |

### お掃除系

| やりたいこと | コマンド |
|------------|---------|
| 未使用のもの全部削除 | `docker system prune` |
| ボリュームも含めて削除 | `docker system prune -a --volumes` |
| ディスク使用量を確認 | `docker system df` |

## docker run のオプション解説

`docker run` は一番よく使うコマンドですが、オプションが多くて混乱しがち。実際によく使うものだけ解説します。

### 基本オプション

```bash
docker run [オプション] イメージ名 [コマンド]
```

| オプション | 意味 | 使用例 |
|-----------|------|--------|
| `-d` | バックグラウンド実行 | `docker run -d nginx` |
| `-it` | 対話モード（コンテナに入る） | `docker run -it ubuntu bash` |
| `--name` | コンテナに名前をつける | `docker run --name web nginx` |
| `--rm` | 終了時に自動削除 | `docker run --rm nginx` |
| `-p` | ポート公開 | `docker run -p 8080:80 nginx` |
| `-v` | ボリュームマウント | `docker run -v ./data:/app/data nginx` |
| `-e` | 環境変数を設定 | `docker run -e DEBUG=true nginx` |
| `--env-file` | 環境変数ファイル指定 | `docker run --env-file .env nginx` |

### ポート指定（-p）の読み方

```bash
docker run -p 8080:80 nginx
#            ↑    ↑
#          ホスト側 コンテナ側
```

「ホストの8080番でアクセスしたら、コンテナの80番に繋ぐ」という意味です。

```
【アクセスの流れ】

ブラウザ  →  localhost:8080  →  コンテナの80番ポート
   ↑              ↑                    ↑
あなた        ホスト側              nginx
```

### ボリュームマウント（-v）の読み方

```bash
docker run -v /home/user/data:/app/data nginx
#            ↑                ↑
#          ホスト側          コンテナ側
```

「ホストの `/home/user/data` をコンテナの `/app/data` として見せる」という意味です。

これにより、コンテナを削除してもデータは消えません。

### よく使う組み合わせ例

```bash
# Webサーバーを立ち上げる
docker run -d --name nginx -p 8080:80 nginx

# MySQLを立ち上げる
docker run -d --name mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  -v mysql_data:/var/lib/mysql \
  -p 3306:3306 \
  mysql:8.0

# 開発用にNode.jsを起動
docker run -it --rm \
  -v $(pwd):/app \
  -w /app \
  -p 3000:3000 \
  node:20 npm run dev
```

## Docker Compose 入門

複数のコンテナを管理するなら、Docker Composeが便利です。

### なぜDocker Composeを使うのか

```bash
# Docker Composeなしだと...（毎回これを打つ？）
docker network create myapp
docker run -d --name db --network myapp -e POSTGRES_PASSWORD=secret postgres
docker run -d --name redis --network myapp redis
docker run -d --name web --network myapp -p 3000:3000 -e DATABASE_URL=... myapp
```

```yaml
# Docker Composeなら...（docker compose up だけ）
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://db:5432/myapp
    depends_on:
      - db
      - redis

  db:
    image: postgres:16
    environment:
      - POSTGRES_PASSWORD=secret
    volumes:
      - db_data:/var/lib/postgresql/data

  redis:
    image: redis:7

volumes:
  db_data:
```

### Docker Compose コマンド

| やりたいこと | コマンド |
|------------|---------|
| 起動 | `docker compose up` |
| バックグラウンドで起動 | `docker compose up -d` |
| 停止 | `docker compose stop` |
| 停止＆削除 | `docker compose down` |
| ボリュームも含めて削除 | `docker compose down -v` |
| ログを見る | `docker compose logs` |
| 特定サービスのログ | `docker compose logs web` |
| ビルドして起動 | `docker compose up -d --build` |
| コンテナに入る | `docker compose exec web bash` |
| 設定の確認 | `docker compose config` |

### 実践的な compose.yaml の例

現場でよく使うパターンを紹介します。

```yaml
# compose.yaml（旧: docker-compose.yml）
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    volumes:
      - .:/app           # ソースコードをマウント
      - /app/node_modules # node_modulesは除外
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgres://postgres:password@db:5432/myapp
    depends_on:
      db:
        condition: service_healthy  # DBが起動するまで待つ
    command: npm run dev

  db:
    image: postgres:16
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"  # 開発時はホストからも接続したい
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

## Dockerfile のベストプラクティス

イメージを自分で作るときに知っておきたいポイントです。

### 基本構成

```dockerfile
# ベースイメージを指定
FROM node:20-slim

# 作業ディレクトリを設定
WORKDIR /app

# 依存ファイルを先にコピー（キャッシュ効率化）
COPY package*.json ./

# 依存をインストール
RUN npm ci --only=production

# アプリケーションをコピー
COPY . .

# 実行ユーザーを変更（セキュリティ）
USER node

# ポートを明示
EXPOSE 3000

# 起動コマンド
CMD ["node", "server.js"]
```

### やってはいけないこと

#### NG1: root ユーザーで実行する

```dockerfile
# ❌ rootで動いてしまう
FROM node:20
COPY . .
CMD ["node", "server.js"]

# ✅ 非rootユーザーで実行
FROM node:20
COPY . .
USER node
CMD ["node", "server.js"]
```

#### NG2: 毎回フルビルドになる構成

```dockerfile
# ❌ コードを変更するたびにnpm installが走る
FROM node:20
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]

# ✅ package.jsonが変わったときだけnpm installが走る
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
```

#### NG3: 不要なファイルをコピーする

```dockerfile
# .dockerignore を作ろう
node_modules
.git
.env
*.log
Dockerfile
docker-compose.yml
```

### マルチステージビルド

本番用の軽量イメージを作るテクニックです。

```dockerfile
# ビルドステージ
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 実行ステージ（軽量イメージを使用）
FROM node:20-slim
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER node
CMD ["node", "dist/server.js"]
```

ビルドに必要なツールは最終イメージに含まれないので、サイズがグッと小さくなります。

## よくあるトラブルと解決法

### コンテナが起動しない

```bash
# まずログを確認
docker logs コンテナ名

# 起動時のエラーを見る
docker run イメージ名  # -d をつけずに実行してエラーを見る
```

### ポートが既に使われている

```
Error: bind: address already in use
```

```bash
# 何が使っているか確認（Mac/Linux）
lsof -i :8080

# Windowsの場合
netstat -ano | findstr :8080

# 別のポートを使う
docker run -p 8081:80 nginx
```

### コンテナからホストに接続したい

```bash
# ホストのMySQLに接続したい場合
# Mac/Windows
docker run -e DB_HOST=host.docker.internal myapp

# Linux
docker run --add-host=host.docker.internal:host-gateway myapp
```

### ディスクがいっぱいになった

```bash
# 何がディスクを食っているか確認
docker system df

# 未使用のものを全削除（確認あり）
docker system prune

# ボリュームも含めて全削除（注意！）
docker system prune -a --volumes
```

### Permission denied エラー

```bash
# ボリュームマウントで権限エラーが出る場合
docker run -v ./data:/app/data --user $(id -u):$(id -g) myapp
```

## 実践Tips

### エイリアスを設定しよう

よく使うコマンドは短くしておくと便利です。

```bash
# ~/.bashrc または ~/.zshrc に追加
alias d='docker'
alias dc='docker compose'
alias dps='docker ps'
alias dex='docker exec -it'
alias dlogs='docker logs -f'

# 使用例
dps          # docker ps
dex web bash # docker exec -it web bash
dlogs web    # docker logs -f web
```

### コンテナをサッと立てて試す

```bash
# Ubuntuでちょっと試したいとき
docker run -it --rm ubuntu bash

# Pythonでちょっと試したいとき
docker run -it --rm python:3.12 python

# Node.jsでちょっと試したいとき
docker run -it --rm node:20 node
```

`--rm` をつけると、終了時に自動でコンテナが消えます。

### .env ファイルを活用する

```bash
# .env
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mysecret
POSTGRES_DB=myapp
```

```yaml
# compose.yaml
services:
  db:
    image: postgres:16
    env_file:
      - .env
```

## まとめ

Dockerコマンドは確かに多いですが、**日常的に使うのはほんの一握り**です。

```
【毎日使うコマンド】

docker run      ← 起動
docker ps       ← 確認
docker stop     ← 停止
docker logs     ← ログ確認
docker exec     ← コンテナに入る

【Docker Composeなら】

docker compose up -d     ← 起動
docker compose down      ← 停止
docker compose logs -f   ← ログ
```

最初はこれだけで十分。使っているうちに自然と他のコマンドも覚えていきます。

大事なのは、**エラーが出ても慌てないこと**。`docker logs` でログを見れば、たいていの問題は解決の糸口が見つかります。

ぜひこのページをブックマークして、困ったときの参考にしてください。

## 参考リンク

- [Docker公式ドキュメント](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)
- [Docker CLI Cheat Sheet（公式）](https://www.docker.com/resources/cli-cheat-sheet/)
- [Docker Compose リファレンス](https://docs.docker.com/compose/)
