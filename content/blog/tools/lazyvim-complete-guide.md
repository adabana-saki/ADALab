---
title: "【2025年版】LazyVim完全ガイド - モダンなNeovim環境を構築しよう"
date: "2025-11-29"
description: "LazyVimの導入から使い方、カスタマイズまで初心者にもわかりやすく解説。Neovimを最強のエディタに変える方法を学びましょう。"
tags: ["LazyVim", "Neovim", "Vim", "エディタ", "開発環境", "Omarchy"]
author: "Adabana Saki"
draft: false
---

# LazyVim完全ガイド - モダンなNeovim環境を構築しよう

**LazyVim**は、Neovimを**すぐに使える本格的な開発環境**に変えてくれる設定（ディストリビューション）です。

VimやNeovimは設定が複雑で有名ですが、LazyVimを使えば最初から便利なプラグインが設定済みの状態で使い始められます。

この記事では、LazyVimの基本から応用まで、初心者にもわかりやすく解説します。

## LazyVimとは？

### Neovimの課題

Neovimは非常に高機能なテキストエディタですが、素の状態では：

- 機能が少ない
- 設定が複雑
- プラグインの選定が大変

そのため、多くの人が「設定に時間がかかりすぎて挫折」してしまいます。

### LazyVimが解決すること

LazyVimは、**実用的なデフォルト設定**と**厳選されたプラグイン**を提供します。

```
【LazyVimのイメージ】

Neovim（素）         LazyVim
┌─────────┐          ┌─────────────────────────┐
│ 最小限の │   →     │ ファイルツリー          │
│ 機能    │          │ 補完機能                │
│         │          │ シンタックスハイライト   │
└─────────┘          │ Git連携                 │
                     │ 検索機能                │
                     │ その他多数...           │
                     └─────────────────────────┘
```

### 動作要件

LazyVimを使うには以下が必要です：

| 項目 | 要件 |
|------|------|
| Neovim | 0.11.2以上（LuaJIT必須） |
| Git | 2.19.0以上 |
| フォント | Nerd Font v3.0以上（推奨） |
| ターミナル | True Color対応 |

## インストール方法

### 既存の設定をバックアップ

まず、既存のNeovim設定をバックアップします（初めての方はスキップ）：

```bash
# 既存の設定をバックアップ
mv ~/.config/nvim ~/.config/nvim.backup
mv ~/.local/share/nvim ~/.local/share/nvim.backup
mv ~/.local/state/nvim ~/.local/state/nvim.backup
mv ~/.cache/nvim ~/.cache/nvim.backup
```

### LazyVimをインストール

```bash
git clone https://github.com/LazyVim/starter ~/.config/nvim
```

### 初回起動

```bash
nvim
```

初回起動時に必要なプラグインが自動的にインストールされます。少し時間がかかりますが、完了するまで待ちましょう。

### Omarchyの場合

Omarchyには**LazyVimがプリインストール**されています。追加の設定は不要です。

## 基本的な使い方

### Vimの基本を理解しよう

LazyVimはNeovim（Vimベース）なので、Vimの基本操作を理解する必要があります。

#### モード

Vimには複数の「モード」があります：

| モード | 説明 | 入り方 |
|--------|------|--------|
| **Normal** | 移動・編集コマンド | `Esc` |
| **Insert** | テキスト入力 | `i`, `a`, `o` |
| **Visual** | 範囲選択 | `v`, `V` |
| **Command** | コマンド実行 | `:` |

```
【モードのイメージ】

Normal（通常）
    │
    ├─ i → Insert（入力）─── Esc ──→ Normal
    │
    ├─ v → Visual（選択）─── Esc ──→ Normal
    │
    └─ : → Command（コマンド）── Enter/Esc ──→ Normal
```

#### 基本的な移動

| キー | 動作 |
|------|------|
| `h` | 左 |
| `j` | 下 |
| `k` | 上 |
| `l` | 右 |
| `w` | 次の単語 |
| `b` | 前の単語 |
| `0` | 行頭 |
| `$` | 行末 |
| `gg` | ファイル先頭 |
| `G` | ファイル末尾 |

#### 基本的な編集

| キー | 動作 |
|------|------|
| `i` | カーソル位置で入力開始 |
| `a` | カーソルの後ろで入力開始 |
| `o` | 下に新しい行を作って入力開始 |
| `O` | 上に新しい行を作って入力開始 |
| `x` | 1文字削除 |
| `dd` | 1行削除 |
| `yy` | 1行コピー |
| `p` | 貼り付け |
| `u` | 元に戻す |
| `Ctrl + r` | やり直し |

### LazyVimのリーダーキー

LazyVimでは`Space`キーが**リーダーキー**です。多くの機能は`Space`から始まります。

```
【リーダーキーのイメージ】

Space を押すと → メニューが表示される

Space + f → ファイル関連
Space + g → Git関連
Space + c → コード関連
Space + b → バッファ関連
...
```

`Space`を押すと、次に何を押せばいいかヒントが表示されます（which-keyプラグイン）。

## よく使う機能

### ファイル操作

| キー | 動作 |
|------|------|
| `Space + e` | ファイルエクスプローラーを開く |
| `Space + f + f` | ファイル検索 |
| `Space + f + r` | 最近開いたファイル |
| `Space + f + g` | ファイル内容を検索（grep） |

#### ファイルエクスプローラー（neo-tree）

`Space + e`でファイルエクスプローラーが開きます。

```
┌─────────────────────────────────────────────────┐
│ neo-tree │ main.py                              │
│ ─────────│                                       │
│ ▼ src/   │ def main():                          │
│   main.py│     print("Hello")                   │
│   utils/ │                                       │
│ ▼ tests/ │                                       │
│   test.py│                                       │
└─────────────────────────────────────────────────┘
```

ファイルエクスプローラーでの操作：

| キー | 動作 |
|------|------|
| `Enter` | ファイルを開く |
| `a` | 新規ファイル/フォルダ作成 |
| `d` | 削除 |
| `r` | リネーム |
| `c` | コピー |
| `m` | 移動 |
| `q` | 閉じる |

### バッファ操作

「バッファ」は開いているファイルのことです。

| キー | 動作 |
|------|------|
| `Space + b + b` | バッファ一覧 |
| `Space + b + d` | バッファを閉じる |
| `H` | 前のバッファ |
| `L` | 次のバッファ |

### ウィンドウ操作

画面を分割して複数のファイルを表示できます。

| キー | 動作 |
|------|------|
| `Space + w + v` | 垂直分割 |
| `Space + w + s` | 水平分割 |
| `Space + w + d` | ウィンドウを閉じる |
| `Ctrl + h/j/k/l` | ウィンドウ間移動 |

```
【ウィンドウ分割のイメージ】

垂直分割（Space + w + v）       水平分割（Space + w + s）
┌──────────┬──────────┐        ┌─────────────────────┐
│          │          │        │                     │
│ ファイル1 │ ファイル2 │        │     ファイル1        │
│          │          │        ├─────────────────────┤
│          │          │        │     ファイル2        │
└──────────┴──────────┘        └─────────────────────┘
```

### 検索

| キー | 動作 |
|------|------|
| `/` | 現在のファイル内を検索 |
| `n` | 次の検索結果 |
| `N` | 前の検索結果 |
| `Space + f + g` | プロジェクト全体を検索 |
| `Space + s + g` | カーソル下の単語を検索 |

### Git連携

LazyVimにはGit連携機能が組み込まれています。

| キー | 動作 |
|------|------|
| `Space + g + g` | Lazygitを開く |
| `Space + g + b` | git blame表示 |
| `Space + g + h + s` | ハンクをステージ |
| `Space + g + h + r` | ハンクをリセット |
| `]h` | 次の変更へ |
| `[h` | 前の変更へ |

## LSP（言語サーバー）

LSP（Language Server Protocol）により、IDE並みの機能が使えます。

### LSPでできること

- **自動補完**: コードを入力すると候補が表示される
- **定義ジャンプ**: 関数の定義場所に移動
- **エラー表示**: リアルタイムでエラーを表示
- **リネーム**: 変数名を一括変更
- **フォーマット**: コードを自動整形

### LSPの操作

| キー | 動作 |
|------|------|
| `g + d` | 定義にジャンプ |
| `g + r` | 参照を表示 |
| `g + D` | 宣言にジャンプ |
| `K` | ホバー情報（ドキュメント表示） |
| `Space + c + a` | コードアクション |
| `Space + c + r` | リネーム |
| `Space + c + f` | フォーマット |

### 補完の使い方

コードを入力すると自動的に補完候補が表示されます。

```
【補完のイメージ】

print|     ← カーソル位置
  ┌─────────────────────┐
  │ print()       関数  │
  │ printf()      関数  │
  │ println()     関数  │
  └─────────────────────┘
```

| キー | 動作 |
|------|------|
| `Ctrl + n` | 次の候補 |
| `Ctrl + p` | 前の候補 |
| `Enter` | 候補を確定 |
| `Ctrl + e` | 補完をキャンセル |

### 言語サーバーの追加

LazyVimはMasonを使って言語サーバーを管理します。

```
:Mason
```

Masonを開いて、必要な言語サーバーをインストールできます。

```
【Mason画面】
┌──────────────────────────────────────────────┐
│ Mason                                        │
│                                              │
│ LSP                                          │
│   ✓ lua_ls           (installed)             │
│   ✓ pyright          (installed)             │
│   ○ typescript-...   (not installed)         │
│                                              │
│ i = install, X = uninstall                   │
└──────────────────────────────────────────────┘
```

## カスタマイズ

### 設定ファイルの構造

LazyVimの設定は以下のような構造です：

```
~/.config/nvim/
├── init.lua           # エントリーポイント
├── lua/
│   ├── config/
│   │   ├── lazy.lua   # プラグインマネージャー設定
│   │   ├── options.lua # 基本オプション
│   │   ├── keymaps.lua # キーマップ
│   │   └── autocmds.lua # 自動コマンド
│   └── plugins/
│       └── *.lua      # カスタムプラグイン設定
└── lazyvim.json       # LazyVimの設定
```

### オプションのカスタマイズ

`~/.config/nvim/lua/config/options.lua`で基本設定を変更できます：

```lua
-- ~/.config/nvim/lua/config/options.lua

-- 行番号の表示
vim.opt.number = true
vim.opt.relativenumber = true

-- タブの設定
vim.opt.tabstop = 4
vim.opt.shiftwidth = 4
vim.opt.expandtab = true

-- 検索の設定
vim.opt.ignorecase = true
vim.opt.smartcase = true

-- クリップボード連携
vim.opt.clipboard = "unnamedplus"

-- マウスを有効化
vim.opt.mouse = "a"
```

### キーマップの追加

`~/.config/nvim/lua/config/keymaps.lua`でキーマップを追加できます：

```lua
-- ~/.config/nvim/lua/config/keymaps.lua

local keymap = vim.keymap.set

-- jkでノーマルモードに戻る
keymap("i", "jk", "<Esc>", { desc = "Exit insert mode" })

-- 行の先頭/末尾に移動
keymap("n", "H", "^", { desc = "Go to line start" })
keymap("n", "L", "$", { desc = "Go to line end" })

-- ウィンドウサイズ調整
keymap("n", "<C-Up>", ":resize +2<CR>", { desc = "Increase height" })
keymap("n", "<C-Down>", ":resize -2<CR>", { desc = "Decrease height" })
```

### プラグインの追加

`~/.config/nvim/lua/plugins/`ディレクトリにLuaファイルを作成します：

```lua
-- ~/.config/nvim/lua/plugins/custom.lua

return {
  -- カラースキーム
  {
    "catppuccin/nvim",
    name = "catppuccin",
    priority = 1000,
  },

  -- GitHub Copilot
  {
    "github/copilot.vim",
    event = "InsertEnter",
  },

  -- Markdown プレビュー
  {
    "iamcco/markdown-preview.nvim",
    ft = "markdown",
    build = function()
      vim.fn["mkdp#util#install"]()
    end,
  },
}
```

### カラースキームの変更

```lua
-- ~/.config/nvim/lua/plugins/colorscheme.lua

return {
  {
    "LazyVim/LazyVim",
    opts = {
      colorscheme = "catppuccin",
    },
  },
}
```

## 便利なプラグイン

LazyVimに追加すると便利なプラグインを紹介します。

### コード補助

| プラグイン | 説明 |
|-----------|------|
| `github/copilot.vim` | GitHub Copilot |
| `Exafunction/codeium.vim` | Codeium（無料のAI補完） |
| `windwp/nvim-autopairs` | 括弧の自動補完 |

### UI強化

| プラグイン | 説明 |
|-----------|------|
| `folke/noice.nvim` | メッセージUI改善 |
| `rcarriga/nvim-notify` | 通知UI |
| `akinsho/bufferline.nvim` | タブ表示 |

### Git強化

| プラグイン | 説明 |
|-----------|------|
| `sindrets/diffview.nvim` | 差分表示 |
| `NeogitOrg/neogit` | Git操作UI |

### 言語サポート

| プラグイン | 説明 |
|-----------|------|
| `mfussenegger/nvim-dap` | デバッガー |
| `nvim-neotest/neotest` | テストランナー |

## トラブルシューティング

### プラグインが動かない

```vim
:Lazy sync
```

これでプラグインの更新と同期が行われます。

### LSPが動かない

```vim
:LspInfo
```

接続されているLSPの状態を確認できます。

### エラーログを確認

```vim
:messages
```

または：

```bash
nvim --headless "+messages" +q
```

### 設定をリセット

```bash
rm -rf ~/.config/nvim
rm -rf ~/.local/share/nvim
rm -rf ~/.cache/nvim

# 再インストール
git clone https://github.com/LazyVim/starter ~/.config/nvim
```

## 実践的なワークフロー

### ファイルを開いて編集

```
1. nvim . でプロジェクトを開く
2. Space + f + f でファイル検索
3. 編集
4. :w で保存
5. Space + b + d でバッファを閉じる
```

### コードの問題を修正

```
1. Space + x + x でトラブルリスト表示
2. エラー箇所に移動
3. Space + c + a でコードアクション
4. 修正を選択
```

### Git操作

```
1. Space + g + g で Lazygit を開く
2. ファイルをステージング
3. コミットメッセージを入力
4. プッシュ
```

## まとめ

LazyVimの主要な操作をまとめます：

| カテゴリ | よく使うキー |
|----------|-------------|
| **ファイル** | `Space + e`, `Space + f + f` |
| **バッファ** | `Space + b + b`, `H/L` |
| **ウィンドウ** | `Ctrl + h/j/k/l`, `Space + w + v/s` |
| **検索** | `/`, `Space + f + g` |
| **Git** | `Space + g + g` |
| **LSP** | `g + d`, `K`, `Space + c + a` |

LazyVimは最初は覚えることが多いですが、慣れると非常に効率的に作業できます。

まずは基本的なファイル操作から始めて、徐々にキーバインドを覚えていきましょう。

## 関連記事

- [Omarchy入門ガイド Part 2](/blog/omarchy-guide-part2-workflow)
- [Lazygit使いこなし術](/blog/lazygit-usage-guide)

## 参考リンク

- [LazyVim公式サイト](https://www.lazyvim.org/)
- [LazyVim GitHub](https://github.com/LazyVim/LazyVim)
- [Neovim公式サイト](https://neovim.io/)
- [LazyVim for Ambitious Developers（無料本）](https://lazyvim-ambitious-devs.phillips.codes/)
