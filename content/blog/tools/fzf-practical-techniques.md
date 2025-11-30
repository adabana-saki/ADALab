---
title: "【2025年版】fzf活用テクニック集 - ファイル検索を劇的に効率化"
date: "2025-11-29"
description: "fzf（ファジーファインダー）の使い方を初心者にもわかりやすく解説。ファイル検索、コマンド履歴、Git連携など、作業効率を上げる実践的なテクニックを紹介します。"
tags: ["fzf", "ターミナル", "コマンドライン", "開発ツール", "Omarchy"]
author: "Adabana Saki"
draft: false
---

# fzf活用テクニック集 - ファイル検索を劇的に効率化

**fzf**（fuzzy finder）は、ターミナルでの検索を**劇的に効率化**するツールです。

「ファイル名をうろ覚えでも見つけられる」「コマンド履歴から一瞬で過去のコマンドを呼び出せる」など、一度使うと手放せなくなります。

この記事では、fzfの基本から実践的なテクニックまで、初心者にもわかりやすく解説します。

## fzfとは？

### 「ファジー検索」とは

fzfの「fuzzy」は「曖昧な」という意味です。

**通常の検索**: 完全一致しないと見つからない

```bash
# 「main.py」を探したい場合
ls | grep main.py  # 「main.py」と正確に入力が必要
```

**ファジー検索**: 曖昧でも見つかる

```bash
# 「mpn」と入力しても「main.py」が見つかる
ls | fzf
# → 「m」「p」「n」が順番に含まれるファイルがヒット
```

### fzfの特徴

| 特徴 | 説明 |
|------|------|
| **高速** | 数百万のアイテムを瞬時に処理 |
| **汎用的** | ファイル、履歴、プロセスなど何でも検索可能 |
| **インタラクティブ** | リアルタイムで結果が絞り込まれる |
| **カスタマイズ可能** | 見た目や動作を自由に設定できる |

## インストール方法

### Omarchyの場合

Omarchyには**プリインストール**されています。追加のインストールは不要です。

### その他の環境

```bash
# macOS
brew install fzf

# Arch Linux
sudo pacman -S fzf

# Ubuntu/Debian
sudo apt install fzf

# Windows (Scoop)
scoop install fzf
```

### シェル統合のセットアップ

fzfの便利なキーバインドを有効にします：

```bash
# Bash
eval "$(fzf --bash)"

# Zsh
source <(fzf --zsh)

# Fish
fzf --fish | source
```

これを`.bashrc`や`.zshrc`に追加しておきます。

## 基本的な使い方

### 最もシンプルな使い方

```bash
fzf
```

これだけで、現在のディレクトリ以下のすべてのファイルを検索できます。

```
【fzfの画面】
┌─────────────────────────────────────────────┐
│  > mai                                      │ ← 入力欄
├─────────────────────────────────────────────┤
│  > src/main.py                              │ ← マッチしたファイル
│    tests/test_main.py                       │
│    docs/maintainer.md                       │
└─────────────────────────────────────────────┘
  3/156                                         ← マッチ数/全体数
```

### 操作方法

| キー | 動作 |
|------|------|
| 文字入力 | 検索パターンを入力 |
| `↑` / `Ctrl+k` | 上の候補に移動 |
| `↓` / `Ctrl+j` | 下の候補に移動 |
| `Enter` | 選択して終了 |
| `Esc` / `Ctrl+c` | キャンセル |
| `Tab` | 複数選択（マルチセレクトモード時） |

### 検索結果を使う

fzfは選択した結果を**標準出力**に出力します。これを他のコマンドと組み合わせます：

```bash
# 選択したファイルをVimで開く
vim $(fzf)

# 選択したファイルをcatで表示
cat $(fzf)

# 選択したファイルをコピー
cp $(fzf) ~/backup/
```

## 検索パターンの書き方

fzfは様々な検索パターンをサポートしています。

### 基本的なパターン

| パターン | 意味 | 例 |
|----------|------|-----|
| `abc` | ファジーマッチ | 「a」「b」「c」が順番に含まれる |
| `'exact` | 完全一致 | 「exact」という文字列を含む |
| `^start` | 前方一致 | 「start」で始まる |
| `.end$` | 後方一致 | 「end」で終わる |
| `!exclude` | 除外 | 「exclude」を含まない |

### 複数の条件を組み合わせる

スペースで区切ると**AND条件**になります：

```bash
# 「main」と「test」の両方を含むファイル
main test

# 「.py」で終わり、「test」を含まないファイル
.py$ !test
```

### 具体例

```bash
# Pythonファイルを検索
.py$

# srcディレクトリ内のファイル
^src/

# テストファイルを除外
!test !spec

# mainで始まるPythonファイル
^main .py$
```

## よく使うシェル連携

シェル統合をセットアップすると、便利なキーバインドが使えます。

### Ctrl+R - コマンド履歴検索

過去に実行したコマンドを検索します。

```bash
# Ctrl+R を押す
┌─────────────────────────────────────────────┐
│  > docker                                   │
├─────────────────────────────────────────────┤
│  > docker compose up -d                     │
│    docker build -t myapp .                  │
│    docker ps -a                             │
└─────────────────────────────────────────────┘
```

**使用例:**

1. `Ctrl+R`を押す
2. 思い出したいコマンドの一部を入力
3. 見つけたら`Enter`で実行

### Ctrl+T - ファイル検索

現在の入力にファイルパスを挿入します。

```bash
# 「vim 」と入力した後に Ctrl+T を押す
vim [Ctrl+T] → ファイル選択画面が開く → vim src/main.py
```

### Alt+C - ディレクトリ移動

ディレクトリを検索して移動します。

```bash
# Alt+C を押す
┌─────────────────────────────────────────────┐
│  > proj                                     │
├─────────────────────────────────────────────┤
│  > ~/Projects/myapp                         │
│    ~/Projects/website                       │
└─────────────────────────────────────────────┘
# 選択するとそのディレクトリに移動
```

## 実践的なテクニック

### 1. プレビュー付きファイル検索

ファイルの中身をプレビューしながら検索できます。

```bash
fzf --preview 'cat {}'
```

より高度なプレビュー（シンタックスハイライト付き）：

```bash
# batがインストールされている場合
fzf --preview 'bat --color=always {}'
```

```
【プレビュー画面】
┌──────────────────┬──────────────────────────────┐
│  > main.py       │  1: def main():              │
│    utils.py      │  2:     print("Hello")       │
│    config.py     │  3:     return True          │
└──────────────────┴──────────────────────────────┘
```

### 2. Gitと連携

#### 変更されたファイルを検索

```bash
git status -s | fzf --preview 'git diff {2}'
```

#### ブランチを検索して切り替え

```bash
git branch | fzf | xargs git checkout
```

#### コミットを検索

```bash
git log --oneline | fzf --preview 'git show {1}'
```

### 3. プロセスを検索してキル

```bash
ps aux | fzf | awk '{print $2}' | xargs kill
```

### 4. 複数ファイルの選択

`-m`オプションで複数選択が可能になります：

```bash
# 複数ファイルを選択してVimで開く
vim $(fzf -m)
```

選択は`Tab`キーで行います：

```
【複数選択】
│  > main.py          │
│  > utils.py     ✓   │  ← Tabで選択済み
│    config.py    ✓   │  ← Tabで選択済み
│    test.py          │
```

### 5. 便利なエイリアス

`.bashrc`や`.zshrc`に追加しておくと便利です：

```bash
# ファイルを検索してVimで開く
alias vf='vim $(fzf)'

# ファイルを検索してcodeで開く
alias cf='code $(fzf)'

# 最近使ったディレクトリに移動（zoxideと連携）
alias zf='cd $(zoxide query -l | fzf)'

# Gitブランチを切り替え
alias gco='git checkout $(git branch | fzf)'

# プロセスを検索してキル
alias fkill='kill $(ps aux | fzf | awk "{print \$2}")'
```

### 6. 環境変数の設定

よく使うオプションをデフォルトに設定できます：

```bash
# ~/.bashrc または ~/.zshrc

# デフォルトオプション
export FZF_DEFAULT_OPTS='
  --height 40%
  --layout=reverse
  --border
  --preview "bat --color=always {} 2>/dev/null || cat {}"
'

# デフォルトのファイル検索コマンド（fdを使用）
export FZF_DEFAULT_COMMAND='fd --type f --hidden --exclude .git'

# Ctrl+Tのコマンド
export FZF_CTRL_T_COMMAND="$FZF_DEFAULT_COMMAND"

# Alt+Cのコマンド（ディレクトリのみ）
export FZF_ALT_C_COMMAND='fd --type d --hidden --exclude .git'
```

## fdとの連携

**fd**はfindコマンドの高速な代替です。fzfと組み合わせると非常に強力です。

### fdのインストール

```bash
# macOS
brew install fd

# Arch Linux
sudo pacman -S fd

# Ubuntu
sudo apt install fd-find
```

### fdを使った検索

```bash
# 隠しファイルを含めて検索
fd --hidden | fzf

# 特定の拡張子のみ
fd -e py | fzf

# ディレクトリのみ
fd -t d | fzf

# .gitを除外
fd --exclude .git | fzf
```

## ripgrepとの連携

**ripgrep**（rg）は高速なgrepの代替です。ファイル内容を検索してからfzfで絞り込めます。

```bash
# ファイル内容を検索してfzfで選択
rg --line-number "" | fzf --delimiter : --preview 'bat --color=always {1} --highlight-line {2}'
```

より使いやすい関数：

```bash
# ~/.bashrc または ~/.zshrc

# ファイル内容を検索してVimで開く
function rgf() {
  local file line
  read -r file line <<< $(rg --line-number "$1" | fzf --delimiter : | awk -F: '{print $1, $2}')
  if [[ -n "$file" ]]; then
    vim "$file" +"$line"
  fi
}
```

使い方：

```bash
rgf "TODO"  # 「TODO」を含む行を検索してVimで開く
```

## Neovimでの活用

LazyVimにはfzf連携が組み込まれています（telescope.nvim）。

| キー | 動作 |
|------|------|
| `Space + f + f` | ファイル検索 |
| `Space + f + g` | ファイル内容検索（grep） |
| `Space + f + r` | 最近開いたファイル |
| `Space + f + b` | バッファ検索 |

## カスタマイズ

### 見た目のカスタマイズ

```bash
export FZF_DEFAULT_OPTS='
  --color=bg+:#313244,bg:#1e1e2e,spinner:#f5e0dc,hl:#f38ba8
  --color=fg:#cdd6f4,header:#f38ba8,info:#cba6f7,pointer:#f5e0dc
  --color=marker:#f5e0dc,fg+:#cdd6f4,prompt:#cba6f7,hl+:#f38ba8
  --border="rounded"
  --border-label="Search"
  --prompt="> "
  --pointer="▶"
  --marker="✓"
'
```

### レイアウトの設定

```bash
# 画面の40%を使用、上から表示
--height 40% --layout=reverse

# フルスクリーン
--height 100%

# ボーダー付き
--border

# ヘッダーを追加
--header="Select a file"
```

## トラブルシューティング

### キーバインドが効かない

シェル統合がセットアップされているか確認：

```bash
# Bashの場合
grep "fzf" ~/.bashrc

# 追加されていなければ追加
echo 'eval "$(fzf --bash)"' >> ~/.bashrc
source ~/.bashrc
```

### 日本語が文字化けする

ターミナルの文字コードがUTF-8になっているか確認：

```bash
echo $LANG
# ja_JP.UTF-8 または en_US.UTF-8 であること
```

### 検索が遅い

`fd`をデフォルトコマンドに設定：

```bash
export FZF_DEFAULT_COMMAND='fd --type f'
```

## 便利なスクリプト集

### 1. 選択したファイルをGitに追加

```bash
function gadd() {
  git status -s | fzf -m --preview 'git diff {2}' | awk '{print $2}' | xargs git add
}
```

### 2. SSHホストを選択して接続

```bash
function fssh() {
  local host
  host=$(grep "^Host " ~/.ssh/config | awk '{print $2}' | fzf)
  if [[ -n "$host" ]]; then
    ssh "$host"
  fi
}
```

### 3. Dockerコンテナを選択して操作

```bash
# コンテナに入る
function dexec() {
  local container
  container=$(docker ps --format "{{.Names}}" | fzf)
  if [[ -n "$container" ]]; then
    docker exec -it "$container" /bin/sh
  fi
}

# コンテナのログを見る
function dlogs() {
  local container
  container=$(docker ps -a --format "{{.Names}}" | fzf)
  if [[ -n "$container" ]]; then
    docker logs -f "$container"
  fi
}
```

### 4. npm scriptsを選択して実行

```bash
function nr() {
  local script
  script=$(cat package.json | jq -r '.scripts | keys[]' | fzf)
  if [[ -n "$script" ]]; then
    npm run "$script"
  fi
}
```

## まとめ

fzfの主要な機能をまとめます：

| 用途 | コマンド/キー |
|------|--------------|
| **ファイル検索** | `fzf` |
| **コマンド履歴** | `Ctrl+R` |
| **ファイル挿入** | `Ctrl+T` |
| **ディレクトリ移動** | `Alt+C` |
| **プレビュー付き** | `fzf --preview 'cat {}'` |
| **複数選択** | `fzf -m` + `Tab` |

fzfを使いこなすと、ターミナルでの作業効率が劇的に向上します。

まずは基本的な`Ctrl+R`（履歴検索）から使い始めて、徐々に他の機能を覚えていきましょう。

## 関連記事

- [Omarchy入門ガイド Part 2](/blog/omarchy-guide-part2-workflow)
- [Lazygit使いこなし術](/blog/lazygit-usage-guide)

## 参考リンク

- [fzf GitHub](https://github.com/junegunn/fzf)
- [fzf Wiki](https://github.com/junegunn/fzf/wiki)
- [fd GitHub](https://github.com/sharkdp/fd)
- [ripgrep GitHub](https://github.com/BurntSushi/ripgrep)
