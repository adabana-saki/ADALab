---
title: "【Git実践編】特殊コマンド＆CI/CD入門2025｜GitHub Actionsで自動化デビュー"
date: "2025-12-06"
publishDate: "2025-12-09"
description: "git tag、git submodule、git hooksなどの特殊コマンドと、GitHub Actionsを使ったCI/CDの基本を初心者向けに解説。実装例つき。"
tags: ["Git", "GitHub", "CI/CD", "GitHub Actions", "自動化", "開発ツール"]
author: "Adabana Saki"
---

# Git実践編：特殊コマンド＆CI/CD入門2025

Gitシリーズも第3弾になりました。

[第1弾](/blog/git-command-cheat-sheet-2025)では基本の5コマンド、[第2弾](/blog/git-advanced-commands-2025)ではcherry-pickやrebaseなどの発展コマンドを学びました。

今回は**知っていると作業効率が上がる特殊コマンド**と、**CI/CD（自動化）の世界**に足を踏み入れます。

「CI/CDって難しそう...」と思うかもしれませんが、仕組みは意外とシンプルです。この記事を読み終える頃には、GitHub Actionsで自動テストを設定できるようになっています。

## この記事で学べること

| カテゴリ | 内容 |
|----------|------|
| **特殊コマンド** | git tag, git blame, git clean, git submodule, git hooks |
| **CI/CD基礎** | CI/CDとは何か、GitHub Actions入門 |
| **実装例** | 自動テスト、自動デプロイの設定ファイル |

---

# Part 1: 知ってると便利な特殊コマンド

## git tag - バージョンに名前をつける

### どういうロジック？

**tag（タグ）は「コミットに貼るラベル」です。**

リリースのタイミングで「v1.0.0」のような名前を付けておくと、後から「あのバージョンのコード」にすぐ戻れます。

```
【tagのイメージ】

●──●──●──●──●──●──●──●
         ↑              ↑
       v1.0.0         v2.0.0
       最初の          大型
       リリース        アップデート
```

### コマンド

```bash
# タグを作成（軽量タグ）
git tag v1.0.0

# メッセージ付きタグ（推奨）
git tag -a v1.0.0 -m "最初の安定版リリース"

# タグ一覧を見る
git tag

# 特定のタグの詳細を見る
git show v1.0.0

# タグをGitHubにプッシュ
git push origin v1.0.0

# 全タグをまとめてプッシュ
git push origin --tags
```

### セマンティックバージョニング

バージョン番号には意味があります。

```
v1.2.3
 │ │ └── パッチ（バグ修正）
 │ └──── マイナー（機能追加、後方互換あり）
 └────── メジャー（破壊的変更、後方互換なし）
```

| 変更内容 | 上げる番号 | 例 |
|---------|-----------|-----|
| バグ修正 | パッチ | v1.0.0 → v1.0.1 |
| 新機能追加 | マイナー | v1.0.1 → v1.1.0 |
| 互換性のない変更 | メジャー | v1.1.0 → v2.0.0 |

## git blame - 誰がいつ書いたか調べる

### どういうロジック？

**blame（ブレイム）は「各行の作者を表示する」機能です。**

名前は「blame（責める）」ですが、責めるためではなく「この行を書いた人に質問したい」「いつ追加されたか知りたい」時に使います。

### コマンド

```bash
# ファイル全体の履歴を見る
git blame index.html

# 出力例
# a1b2c3d4 (田中太郎 2025-01-15) <header>
# d4e5f6g7 (山田花子 2025-02-20)   <nav>ナビゲーション</nav>
# a1b2c3d4 (田中太郎 2025-01-15) </header>

# 特定の行だけ見る（10〜20行目）
git blame -L 10,20 index.html
```

### VS Codeで使う方法

コマンドを打たなくても、**GitLens拡張機能**を入れると、カーソルを置いた行の作者が自動で表示されます。おすすめです。

## git clean - 追跡されていないファイルを削除

### どういうロジック？

**clean（クリーン）は「Gitが追跡していないファイルを削除する」機能です。**

ビルドで生成されたファイルや、一時的に作ったファイルを一掃したい時に使います。

```
【cleanの対象】
├── src/
│   └── index.js      ← Git管理下 → 消えない
├── dist/
│   └── bundle.js     ← .gitignoreに記載 → 消えない
└── temp.txt          ← 追跡されていない → 消える！
```

### コマンド

```bash
# まず何が消えるか確認（ドライラン）
git clean -n

# 出力例
# Would remove temp.txt
# Would remove debug.log

# 確認してから実際に削除
git clean -f

# ディレクトリも含めて削除
git clean -fd

# .gitignoreのファイルも含めて削除（注意！）
git clean -fdx
```

**重要**: 必ず `-n` で確認してから `-f` を実行してください。消えたファイルは復元できません。

## git submodule - 別リポジトリを組み込む

### どういうロジック？

**submodule（サブモジュール）は「プロジェクト内に別のGitリポジトリを埋め込む」機能です。**

共通ライブラリやテーマなど、別リポジトリで管理されているコードを取り込む時に使います。

```
【submoduleのイメージ】

my-project/
├── src/
│   └── main.js
├── lib/
│   └── shared-utils/    ← 別リポジトリがここに入る
├── .gitmodules          ← サブモジュールの設定ファイル
└── package.json
```

### コマンド

```bash
# サブモジュールを追加
git submodule add https://github.com/example/library.git lib/library

# サブモジュールを含むリポジトリをクローン
git clone --recurse-submodules https://github.com/your/project.git

# クローン後にサブモジュールを初期化（忘れた場合）
git submodule update --init

# サブモジュールを最新版に更新
git submodule update --remote
```

### 注意点

サブモジュールを含むリポジトリをクローンする人は、`--recurse-submodules` オプションを付けるか、クローン後に `git submodule update --init` を実行する必要があります。

## git hooks - コミット前に自動チェック

### どういうロジック？

**hooks（フック）は「Gitの操作に連動して自動でスクリプトを実行する」機能です。**

コミット前にリンターを走らせたり、プッシュ前にテストを実行したりできます。

```
【hooksのイメージ】

git commit を実行
       ↓
┌─────────────────────┐
│ pre-commit フック    │
│ リンター実行         │
└─────────────────────┘
       ↓
   エラーあり？
   ├─ Yes → コミット中止
   └─ No  → コミット完了
```

### よく使うフック

| フック名 | タイミング | 用途 |
|---------|-----------|------|
| `pre-commit` | コミット前 | リンター、フォーマッター |
| `commit-msg` | メッセージ入力後 | メッセージ形式チェック |
| `pre-push` | プッシュ前 | テスト実行 |

### husky + lint-staged（Node.jsプロジェクト向け）

手動でフックを設定するのは大変なので、Node.jsプロジェクトでは **husky** と **lint-staged** というツールがよく使われます。

```bash
# インストール
npm install -D husky lint-staged

# huskyを初期化
npx husky init
```

```json
// package.json に追加
{
  "lint-staged": {
    "*.{js,ts}": ["eslint --fix", "prettier --write"]
  }
}
```

これで、コミット時に変更したファイルだけ自動でリント＆フォーマットされます。

---

# Part 2: CI/CD 入門

## CI/CDとは？超やさしく解説

### CIとは（継続的インテグレーション）

**CI = コードを変更するたびに自動でテストを実行する仕組み**

```
【CIのイメージ】

あなたがコードをpush
       ↓
┌─────────────────────┐
│   GitHub Actions    │
│   自動でテスト実行   │
└─────────────────────┘
       ↓
   テスト結果を通知
   ✓ 成功 or ✗ 失敗
```

「自分のPCでは動いたのに、他の人の環境では動かない」という問題を早期に発見できます。

### CDとは（継続的デリバリー/デプロイ）

**CD = テストが通ったら自動でデプロイする仕組み**

```
【CDのイメージ】

テスト成功
    ↓
┌─────────────────────┐
│   自動ビルド        │
│   成果物を作成       │
└─────────────────────┘
    ↓
┌─────────────────────┐
│   自動デプロイ       │
│   本番環境に公開     │
└─────────────────────┘
```

手作業でのデプロイミスを防ぎ、リリースを高速化できます。

### なぜCI/CDが必要？

- **手動テストの漏れを防ぐ**: 毎回同じテストが自動で走る
- **デプロイ作業を自動化**: 「デプロイ忘れ」「手順ミス」がなくなる
- **チーム全員が同じ品質基準**: PRが通る = 最低限の品質が保証される

## GitHub Actions 入門

### GitHub Actionsとは

GitHubに組み込まれた**無料のCI/CDツール**です。

- パブリックリポジトリは**無制限**で使える
- YAMLファイルを置くだけで設定完了
- 豊富な既存Actionを再利用できる

### 基本用語

| 用語 | 意味 | 例え |
|------|------|------|
| **Workflow** | 自動化の全体設定 | レシピ全体 |
| **Job** | タスクのまとまり | 「材料を切る」工程 |
| **Step** | 個々の処理 | 「玉ねぎを切る」 |
| **Action** | 再利用可能な部品 | 「みじん切り器」 |
| **Runner** | 実行環境 | キッチン |

### ディレクトリ構造

```
.github/
└── workflows/
    ├── test.yml       ← テスト用ワークフロー
    ├── lint.yml       ← リンター用ワークフロー
    └── deploy.yml     ← デプロイ用ワークフロー
```

`.github/workflows/` フォルダにYAMLファイルを置くだけで、GitHub Actionsが自動で認識します。

## 実装例1: 自動テストの設定

最もシンプルなワークフローを作ってみましょう。

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
```

### 各行の意味

| 行 | 意味 |
|----|------|
| `name: Test` | ワークフローの名前（GitHub上で表示される） |
| `on: push, pull_request` | いつ実行するか（push時とPR時） |
| `branches: [main]` | mainブランチへの変更のみ対象 |
| `runs-on: ubuntu-latest` | Ubuntu環境で実行 |
| `uses: actions/checkout@v4` | リポジトリのコードを取得 |
| `uses: actions/setup-node@v4` | Node.js環境をセットアップ |
| `run: npm ci` | 依存関係をインストール |
| `run: npm test` | テストを実行 |

## 実装例2: 自動デプロイの設定

Cloudflare Pagesへの自動デプロイ例です。

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: my-project
          directory: dist
```

### シークレットの設定方法

APIトークンなどの秘密情報は、**Secrets**に保存します。

1. GitHubリポジトリの **Settings** を開く
2. **Secrets and variables** → **Actions** を選択
3. **New repository secret** をクリック
4. 名前（例: `CLOUDFLARE_API_TOKEN`）と値を入力

ワークフロー内では `${{ secrets.名前 }}` で参照できます。

## 実装例3: PRにリンター結果を表示

```yaml
# .github/workflows/lint.yml
name: Lint

on: [pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: npm ci
      - run: npm run lint
```

これでPRを作るたびに自動でリンターが走り、結果がPRページに表示されます。

## よく使うワークフローパターン

| やりたいこと | 設定 |
|-------------|------|
| PRごとにテスト | `on: [pull_request]` |
| mainマージでデプロイ | `on: push` + `branches: [main]` |
| 毎日定時実行 | `on: schedule` + `cron: '0 0 * * *'` |
| 手動で実行 | `on: workflow_dispatch` |

```yaml
# 手動実行の例
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'デプロイ先環境'
        required: true
        default: 'staging'
```

---

# Part 3: まとめ

## 特殊コマンド早見表

| コマンド | 何をする | 使う場面 |
|----------|----------|----------|
| `git tag` | バージョンラベルを付ける | リリース時 |
| `git blame` | 誰がいつ書いたか調べる | 調査・質問時 |
| `git clean` | 追跡外ファイルを削除 | クリーンアップ |
| `git submodule` | 別リポジトリを組み込む | ライブラリ管理 |
| `git hooks` | 操作に連動して自動実行 | 品質管理 |

## CI/CD設定の始め方

1. `.github/workflows/` フォルダを作成
2. YAMLファイル（例: `test.yml`）を作成
3. pushしてGitHubにアップロード
4. リポジトリの **Actions** タブで結果を確認

最初は自動テストから始めて、慣れてきたら自動デプロイに挑戦してみてください。

## Gitシリーズ全体のまとめ

```
【シリーズ構成】

第1弾：基本の5コマンド
├── git clone, add, commit, push, pull
└── 日常の8割はこれでカバー

第2弾：発展コマンド
├── git stash, cherry-pick, rebase
├── git revert, bisect, reflog, worktree
└── 「困った時」に助けてくれる

第3弾：特殊コマンド + CI/CD（この記事）
├── git tag, blame, clean, submodule, hooks
├── GitHub Actions で自動化
└── チーム開発・本番運用に必須
```

**ここまで来たら、あなたはもうGit中級者です。**

全部を今すぐ覚える必要はありません。必要な時にこのシリーズに戻ってきてください。

一緒にGitを使いこなしていきましょう。

## シリーズリンク

- [第1弾：【超初心者向け】Gitコマンド完全チートシート2025](/blog/git-command-cheat-sheet-2025)
- [第2弾：【Git中級者への道】知ってると得する発展Gitコマンド集2025](/blog/git-advanced-commands-2025)

## 参考リンク

- [GitHub Actions公式ドキュメント](https://docs.github.com/ja/actions)
- [GitHub Actions マーケットプレイス](https://github.com/marketplace?type=actions)
- [セマンティックバージョニング](https://semver.org/lang/ja/)
