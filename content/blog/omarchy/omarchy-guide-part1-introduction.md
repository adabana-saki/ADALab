---
title: "【2025年版】Omarchy入門ガイド Part 1 - 美しいLinux開発環境を始めよう"
date: "2025-11-29"
description: "DHH（Ruby on Rails創設者）が作ったモダンなLinuxディストリビューション「Omarchy」の魅力と導入方法を初心者向けに解説します。"
tags: ["Omarchy", "Linux", "開発環境", "初心者向け", "Hyprland"]
author: "ADA Lab"
---

# Omarchy入門ガイド Part 1 - 美しいLinux開発環境を始めよう

「Linuxは難しそう」「設定が面倒」と思っていませんか？

**Omarchy**は、Ruby on Railsの創設者であるDHH（David Heinemeier Hansson）が開発した、**美しくてすぐに使える**Linuxディストリビューションです。

この記事では、Omarchyの魅力と導入方法を初心者向けにわかりやすく解説します。

## Omarchyとは？

Omarchyは、**Arch Linux**と**Hyprland**タイルウィンドウマネージャーをベースにした、開発者向けのLinuxディストリビューションです。

```
Omarchy = Arch Linux + Hyprland + 厳選されたツール + 美しいテーマ
```

### 特徴

| 特徴 | 説明 |
|------|------|
| **すぐに使える** | インストール直後から開発に必要なツールが揃っている |
| **美しいUI** | 14種類以上の統一されたテーマ |
| **高速** | タイルウィンドウマネージャーによる軽快な動作 |
| **セキュア** | フルディスク暗号化がデフォルト |
| **最新** | ローリングリリースで常に最新 |

### なぜDHHがOmarchyを作ったのか？

DHHはmacOSからLinuxへ移行する際、既存のLinuxディストリビューションに満足できませんでした。

> 「開発者がすぐに生産的になれる、美しくて実用的なLinux環境が欲しかった」

その結果生まれたのがOmarchyです。37signalsによって開発・サポートされており、Basecamp、HEY、ONCEなどのサービスで使われている実績があります。

## 動作環境

### 必要なスペック

| 項目 | 最小要件 | 推奨 |
|------|----------|------|
| CPU | 64bit x86_64 | 最新のIntel/AMD |
| メモリ | 4GB | 16GB以上 |
| ストレージ | 20GB | 256GB以上のSSD |
| GPU | NVIDIA/AMD/Intel | NVIDIA推奨 |

### 注意点

- **Secure Boot**と**TPM**をBIOSで無効化する必要があります
- Intel Macに対応（M1/M2などApple Siliconは非対応）
- インストール時にドライブは完全にフォーマットされます

## インストール方法

### Step 1: ISOファイルのダウンロード

公式サイトからISOファイルをダウンロードします。

1. [iso.omarchy.org](https://iso.omarchy.org) にアクセス
2. 最新版（v3.2.2など）をダウンロード
3. ファイルサイズは約4GB程度

### Step 2: ブータブルUSBの作成

ダウンロードしたISOをUSBドライブに書き込みます。

**推奨ツール:**
- **balenaEtcher**（Windows/Mac/Linux対応）
- **Rufus**（Windows）

```bash
# Linuxの場合はddコマンドも使用可能
sudo dd if=omarchy-3.2.2.iso of=/dev/sdX bs=4M status=progress
```

> 💡 **注意**: `/dev/sdX`は実際のUSBデバイス名に置き換えてください

### Step 3: BIOSの設定

PCを再起動し、BIOS設定画面に入ります（F2、F12、Deleteキーなど）。

1. **Secure Boot**: 無効（Disabled）
2. **TPM**: 無効（Disabled）
3. **Boot順序**: USBを最優先に設定

### Step 4: インストーラーの実行

USBから起動すると、インストーラーが自動的に開始されます。

以下の質問に答えていきます：

1. **ディスクの選択** - インストール先のドライブ
2. **ユーザー名** - ログインに使用する名前
3. **パスワード** - ログインとディスク暗号化に使用
4. **タイムゾーン** - Asia/Tokyoを選択
5. **ホスト名** - PCの名前

インストールは約10〜15分で完了します。

### Step 5: 初回起動

インストール完了後、USBを取り外して再起動します。

1. パスワードを入力してディスクを復号化
2. ログイン画面でユーザー名とパスワードを入力
3. 美しいデスクトップが表示されます！

## 基本操作を覚えよう

Omarchyは**キーボード中心**の操作が特徴です。最初は慣れが必要ですが、覚えると非常に効率的に作業できます。

### 必須キーバインド

| キー | 動作 |
|------|------|
| `Super + Space` | アプリケーションランチャー |
| `Super + Return` | ターミナルを開く |
| `Super + Alt + Space` | Omarchyメニュー（設定画面） |
| `Super + K` | ホットキー一覧を表示 |
| `Super + Q` | ウィンドウを閉じる |

> 💡 **Super**キーはWindowsキー（⊞）またはCommandキー（⌘）です

### アプリケーションの起動

| キー | アプリケーション |
|------|------------------|
| `Super + Shift + B` | ブラウザ（Zen Browser） |
| `Super + Shift + E` | ファイルマネージャー |
| `Super + Shift + O` | Obsidian |
| `Super + Shift + D` | Docker管理（Lazydocker） |

### ウィンドウ操作

Omarchyはタイルウィンドウマネージャーを採用しています。ウィンドウが自動的に画面を分割して配置されます。

| キー | 動作 |
|------|------|
| `Super + J` | レイアウト切替（水平/垂直） |
| `Super + F` | フルスクリーン |
| `Super + T` | 浮動/タイル切替 |
| `Super + 1〜9` | ワークスペース切替 |
| `Super + Shift + 1〜9` | ウィンドウを別ワークスペースに移動 |

## プリインストールされているツール

Omarchyには開発に必要なツールが最初から揃っています。

### エディタ

- **Neovim** - LazyVim設定済み（デフォルト）
- **VSCode** / **Cursor** / **Zed** - GUIエディタも選択可能

### 開発ツール

| ツール | 説明 |
|--------|------|
| **Git** | バージョン管理 |
| **Lazygit** | Git操作のTUI |
| **Docker** | コンテナ管理 |
| **Lazydocker** | Docker操作のTUI |
| **ripgrep** | 高速検索 |
| **fzf** | ファジーファインダー |
| **Zoxide** | スマートなcd |

### アプリケーション

| アプリ | 説明 |
|--------|------|
| **Zen Browser** | プライバシー重視のブラウザ |
| **Obsidian** | ノートアプリ |
| **1Password** | パスワードマネージャー |
| **Spotify** | 音楽ストリーミング |
| **LibreOffice** | オフィススイート |

## テーマを変更してみよう

Omarchyには14種類以上の美しいテーマが用意されています。

### テーマの変更方法

1. `Super + Alt + Space`でOmarchyメニューを開く
2. **Appearance** → **Theme** を選択
3. 好みのテーマを選択

または、ショートカットで直接選択：

```
Super + Ctrl + Shift + Space
```

### 人気のテーマ

| テーマ名 | 特徴 |
|----------|------|
| **Tokyo Night** | 夜の東京をイメージしたダークテーマ |
| **Catppuccin** | パステルカラーのモダンなテーマ |
| **Dracula** | 定番のダークテーマ |
| **Rose Pine** | エレガントなダークテーマ |
| **Ethereal** | 幻想的な雰囲気のテーマ |

テーマはターミナル、Neovim、ロック画面まで統一されるため、一貫した美しい見た目になります。

## システムのアップデート

Omarchyはローリングリリースを採用しているため、常に最新のソフトウェアを使用できます。

### アップデート方法

1. `Super + Alt + Space`でOmarchyメニューを開く
2. **Update** → **Omarchy** を選択

アップデート前に自動でスナップショットが作成されるため、問題が発生しても簡単にロールバックできます。

## 次のステップ

これでOmarchyの基本的な使い方がわかりました！

**次回の記事**では、以下の内容を解説します：

- 開発ワークフローの効率化
- Neovimの使い方
- Lazygitでのバージョン管理
- Dockerの活用方法

→ [Omarchy実践ガイド Part 2 - 開発ワークフローを極める](/blog/omarchy-guide-part2-workflow)

## まとめ

Omarchyは、**美しさ**と**実用性**を兼ね備えたLinuxディストリビューションです。

- DHH（Ruby on Rails創設者）が開発
- インストール直後から開発に必要なツールが揃っている
- キーボード中心の効率的な操作
- 14種類以上の美しいテーマ
- セキュアなデフォルト設定

Linuxに興味があるけど躊躇していた方、macOSから移行を考えている方、ぜひOmarchyを試してみてください。

## 参考リンク

- [Omarchy公式サイト](https://omarchy.org/)
- [GitHubリポジトリ](https://github.com/basecamp/omarchy)
- [Omarchyマニュアル](https://learn.omacom.io/)
- [Awesome Omarchy](https://github.com/aorumbayev/awesome-omarchy)
