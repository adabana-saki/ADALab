---
title: "【2025年版】Omarchy実践ガイド Part 2 - 開発ワークフローを極める"
date: "2025-11-29"
description: "Omarchyの開発ツールを使いこなして、効率的な開発ワークフローを構築する方法を解説します。Neovim、Lazygit、Docker、fzfなど。"
tags: ["Omarchy", "Linux", "開発環境", "Neovim", "Docker", "Git"]
author: "Adabana Saki"
---

# Omarchy実践ガイド Part 2 - 開発ワークフローを極める

[Part 1](https://adalab.pages.dev/blog/omarchy-guide-part1-introduction)では、Omarchyの基本的なインストールと操作方法を学びました。

この記事では、Omarchyに搭載されている開発ツールを使いこなして、**効率的な開発ワークフロー**を構築する方法を解説します。

## Neovimで高速コーディング

Omarchyのデフォルトエディタは**Neovim**です。LazyVim設定がプリインストールされており、すぐに本格的な開発環境として使えます。

### Neovimの起動

```bash
# ターミナルから起動
nvim

# ファイルを指定して起動
nvim main.py

# ディレクトリを指定して起動
nvim .
```

### 基本的な操作

Neovimはモード切替で操作します：

| モード | 説明 | 切り替え |
|--------|------|----------|
| **Normal** | 移動・編集コマンド | `Esc` |
| **Insert** | テキスト入力 | `i` / `a` / `o` |
| **Visual** | 範囲選択 | `v` / `V` |
| **Command** | コマンド実行 | `:` |

### 必須キーバインド（LazyVim）

LazyVimでは`Space`キーがリーダーキーです：

| キー | 動作 |
|------|------|
| `Space + e` | ファイルエクスプローラー |
| `Space + f + f` | ファイル検索（fuzzy finder） |
| `Space + f + g` | 文字列検索（grep） |
| `Space + b + b` | バッファ切り替え |
| `Space + c + a` | コードアクション |
| `Space + c + r` | リネーム |
| `Space + x + x` | トラブルリスト（エラー表示） |

### ウィンドウ操作

| キー | 動作 |
|------|------|
| `Ctrl + h/j/k/l` | ウィンドウ間移動 |
| `Space + w + v` | 垂直分割 |
| `Space + w + s` | 水平分割 |
| `Space + w + d` | ウィンドウを閉じる |

### LSP（言語サーバー）

LazyVimは多くの言語のLSPを自動設定します：

```
# 対応言語（一部）
- TypeScript / JavaScript
- Python
- Rust
- Go
- Ruby
- Lua
```

LSP機能：

| キー | 動作 |
|------|------|
| `g + d` | 定義にジャンプ |
| `g + r` | 参照を表示 |
| `K` | ホバー情報表示 |
| `Space + c + f` | フォーマット |

### プラグインの追加

LazyVimでは簡単にプラグインを追加できます：

```lua
-- ~/.config/nvim/lua/plugins/custom.lua
return {
  {
    "github/copilot.vim",
    event = "InsertEnter",
  },
}
```

## Lazygitでバージョン管理

**Lazygit**はGit操作のためのTUI（テキストユーザーインターフェース）ツールです。複雑なGit操作を視覚的に行えます。

### 起動方法

```bash
# ターミナルから
lazygit

# Neovim内から
Space + g + g
```

### 画面構成

```
┌─────────────────────────────────────────────────────────┐
│ Status (1) │ Files (2) │ Branches (3) │ Commits (4)     │
├────────────┴───────────┴──────────────┴─────────────────┤
│                                                         │
│              メインパネル（差分表示など）                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 基本操作

| キー | 動作 |
|------|------|
| `1〜5` | パネル切り替え |
| `h/l` | パネル移動 |
| `j/k` | 項目移動 |
| `Enter` | 選択/展開 |
| `?` | ヘルプ表示 |
| `q` | 終了 |

### ファイル操作

| キー | 動作 |
|------|------|
| `Space` | ステージング/アンステージング |
| `a` | すべてステージング |
| `c` | コミット |
| `A` | コミット --amend |
| `d` | 変更を破棄 |
| `e` | ファイルを編集 |

### ブランチ操作

| キー | 動作 |
|------|------|
| `n` | 新規ブランチ作成 |
| `Space` | チェックアウト |
| `M` | マージ |
| `r` | リベース |
| `d` | ブランチ削除 |

### コミット操作

| キー | 動作 |
|------|------|
| `s` | スカッシュ |
| `f` | fixup |
| `r` | reword（メッセージ変更） |
| `d` | ドロップ |
| `g` | リセット |

### 実践的なワークフロー

**1. 変更をコミット**

```
1. Filesパネルで変更を確認
2. Spaceでファイルをステージング
3. cでコミットメッセージを入力
```

**2. インタラクティブリベース**

```
1. Commitsパネルで対象コミットを選択
2. eでリベース開始
3. 各コミットを編集（s=スカッシュ, r=rewordなど）
4. リベース完了
```

**3. コンフリクト解決**

```
1. コンフリクトがあるファイルを選択
2. eでエディタで編集
3. 解決後、Spaceでステージング
4. 続行
```

## Lazydockerでコンテナ管理

**Lazydocker**はDocker操作のためのTUIツールです。

### 起動方法

```bash
# ターミナルから
lazydocker

# ショートカット
Super + Shift + D
```

### 基本操作

| キー | 動作 |
|------|------|
| `[` / `]` | パネル切り替え |
| `j/k` | 項目移動 |
| `d` | コンテナ削除 |
| `s` | 停止 |
| `r` | 再起動 |
| `a` | アタッチ（ログ表示） |
| `e` | シェルに入る |
| `b` | ビルド |

### 便利な機能

- **リアルタイムログ** - コンテナのログをリアルタイムで確認
- **リソース監視** - CPU/メモリ使用量を表示
- **ボリューム管理** - ボリュームの確認・削除
- **イメージ管理** - イメージの確認・削除

## fzfで高速ファイル検索

**fzf**は曖昧検索（fuzzy finder）ツールです。ファイル名や履歴を素早く検索できます。

### 基本的な使い方

```bash
# ファイル検索
ff

# または
fzf

# コマンド履歴検索
Ctrl + R
```

### よく使うパターン

```bash
# ファイル検索してVimで開く
nvim $(fzf)

# パイプと組み合わせ
cat file.txt | fzf

# プレビュー付き検索
fzf --preview 'cat {}'
```

### fzfの便利な設定

Omarchyでは以下のエイリアスが設定されています：

```bash
# ff - ファイル検索
ff

# fh - コマンド履歴
Ctrl + R

# fd - ディレクトリ検索
fcd
```

## Zoxideでスマートなディレクトリ移動

**Zoxide**は`cd`コマンドの強化版です。よく使うディレクトリを学習して、少ないキータイプで移動できます。

### 基本的な使い方

```bash
# 通常のcd
z /home/user/projects/myapp

# 学習後は部分一致でOK
z myapp

# 曖昧検索モード
zi
```

### 仕組み

Zoxideはディレクトリへのアクセス頻度を記録し、スコアリングします：

```bash
# スコアを確認
zoxide query -l

# 例
10.5    /home/user/projects/myapp
8.2     /home/user/documents
5.1     /home/user/downloads
```

## ripgrepで高速コード検索

**ripgrep**（`rg`）は非常に高速なgrep代替ツールです。

### 基本的な使い方

```bash
# パターン検索
rg "function"

# 特定のファイルタイプのみ
rg "TODO" --type rust

# 大文字小文字を無視
rg -i "error"

# ファイル名のみ表示
rg -l "import"
```

### 便利なオプション

```bash
# 行番号付き（デフォルト）
rg -n "pattern"

# コンテキスト表示（前後3行）
rg -C 3 "error"

# 隠しファイルも検索
rg --hidden "config"

# .gitignoreを無視して検索
rg --no-ignore "secret"
```

### Neovimとの連携

Neovimの`Space + f + g`でripgrepを使ったプロジェクト全体検索ができます。

## シェル便利関数

Omarchyには便利なシェル関数が用意されています。

### ファイル操作

```bash
# tar.gz圧縮
compress mydir

# tar.gz解凍
decompress archive.tar.gz
```

### USB/ドライブ操作

```bash
# ISOからブータブルUSB作成
iso2sd /path/to/file.iso

# ドライブをexFATフォーマット
format-drive /dev/sdX
```

## 統合開発ワークフローの例

ここまで紹介したツールを組み合わせた実践的なワークフローを紹介します。

### 1. プロジェクトへ移動

```bash
# Zoxideで素早く移動
z myproject
```

### 2. ファイルを開く

```bash
# fzfでファイル検索してNeovimで開く
nvim $(fzf)

# またはNeovim内で
Space + f + f
```

### 3. コーディング

```
- LSPによる補完・エラー表示
- Space + c + a でコードアクション
- Space + c + f でフォーマット
```

### 4. ターミナル操作

```bash
# Neovim内でターミナルを開く
:terminal

# または別ウィンドウで
Super + Return
```

### 5. 変更をコミット

```bash
# Neovim内からLazygitを開く
Space + g + g

# ファイルをステージング → コミット
```

### 6. Dockerコンテナの確認

```bash
# Lazydockerで状態確認
Super + Shift + D
```

## 次のステップ

開発ワークフローの基本をマスターしました！

**次回の記事**では、以下の内容を解説します：

- テーマのカスタマイズと自作
- Hyprlandの設定変更
- キーバインドのカスタマイズ
- 拡張機能のインストール

→ [Omarchyカスタマイズガイド Part 3 - 自分だけの環境を作る](https://adalab.pages.dev/blog/omarchy-guide-part3-customization)

## まとめ

この記事で紹介したツールを使いこなせば、マウスに頼らない効率的な開発ワークフローが構築できます：

| ツール | 用途 |
|--------|------|
| **Neovim** | 高速コーディング |
| **Lazygit** | 視覚的なGit操作 |
| **Lazydocker** | コンテナ管理 |
| **fzf** | 曖昧ファイル検索 |
| **Zoxide** | スマートなディレクトリ移動 |
| **ripgrep** | 高速コード検索 |

最初は覚えることが多く感じるかもしれませんが、一度身につければ生産性が大きく向上します。

毎日少しずつ新しいキーバインドを覚えていきましょう！

## 参考リンク

- [LazyVim公式ドキュメント](https://www.lazyvim.org/)
- [Lazygit GitHub](https://github.com/jesseduffield/lazygit)
- [Lazydocker GitHub](https://github.com/jesseduffield/lazydocker)
- [fzf GitHub](https://github.com/junegunn/fzf)
- [Zoxide GitHub](https://github.com/ajeetdsouza/zoxide)
- [ripgrep GitHub](https://github.com/BurntSushi/ripgrep)
