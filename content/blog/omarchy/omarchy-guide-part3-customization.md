---
title: "【2025年版】Omarchyカスタマイズガイド Part 3 - 自分だけの環境を作る"
date: "2025-11-29"
description: "Omarchyのテーマ変更、Hyprland設定、キーバインドのカスタマイズなど、上級者向けのカスタマイズ方法を解説します。"
tags: ["Omarchy", "Linux", "カスタマイズ", "Hyprland", "上級者向け"]
author: "Adabana Saki"
---

# Omarchyカスタマイズガイド Part 3 - 自分だけの環境を作る

[Part 1](/blog/omarchy-guide-part1-introduction)でインストール、[Part 2](/blog/omarchy-guide-part2-workflow)で開発ツールの使い方を学びました。

この記事では、Omarchyを**自分好みにカスタマイズ**する方法を上級者向けに解説します。

## 設定ファイルの構造

Omarchyの設定は`~/.config`ディレクトリに集約されています。

```
~/.config/
├── hypr/
│   ├── hyprland.conf      # メイン設定（キーバインド、デフォルトアプリ）
│   ├── input.conf         # キーボード・マウス・トラックパッド
│   └── monitors.conf      # ディスプレイ設定
├── waybar/
│   └── config.jsonc       # トップバー
├── starship.toml          # シェルプロンプト
├── ghostty/
│   └── config             # ターミナル設定
├── nvim/
│   └── lua/               # Neovim設定
└── omarchy/
    └── [テーマ名]/        # テーマ別設定
```

### 設定エディタの起動

```bash
# Omarchyメニューから
Super + Alt + Space → Setup → Configs

# 直接編集
nvim ~/.config/hypr/hyprland.conf
```

## テーマのカスタマイズ

### 公式テーマの追加

Omarchyには14種類の公式テーマがありますが、コミュニティ製テーマも追加できます。

**インストール方法:**

1. `Super + Alt + Space`でOmarchyメニューを開く
2. **Install** → **Style** → **Theme** を選択
3. テーマのGitHub URLを入力

```
https://github.com/username/omarchy-theme-name
```

**削除方法:**

1. **Remove** → **Style** → **Theme** を選択
2. 削除するテーマを選択

### コミュニティテーマ

[Awesome Omarchy](https://github.com/aorumbayev/awesome-omarchy)には120以上のテーマが登録されています：

| カテゴリ | テーマ例 |
|----------|----------|
| **ダーク** | Dracula, Rose Pine, Solarized Dark |
| **レトロ** | NES, VHS80, C64 |
| **日本風** | Akane, Kimiko, Sakura |
| **自然派** | Forest Green, Evergarden |

### テーマの自作

テーマを自作する場合は、既存テーマをベースにするのが効率的です。

**1. テーマディレクトリを作成**

```bash
mkdir -p ~/.config/omarchy/mytheme
cd ~/.config/omarchy/mytheme
```

**2. 必要なファイルを配置**

```
mytheme/
├── colors.conf          # カラー定義
├── hyprland.conf        # Hyprland設定
├── waybar.css           # Waybar スタイル
├── ghostty.conf         # ターミナル設定
├── nvim.lua             # Neovim カラースキーム
├── backgrounds/         # 壁紙フォルダ
│   └── wallpaper.jpg
└── theme.toml           # テーマメタデータ
```

**3. colors.confの例**

```bash
# ~/.config/omarchy/mytheme/colors.conf

$background = rgb(1a1b26)
$foreground = rgb(c0caf5)
$cursor = rgb(c0caf5)

$color0 = rgb(15161e)    # Black
$color1 = rgb(f7768e)    # Red
$color2 = rgb(9ece6a)    # Green
$color3 = rgb(e0af68)    # Yellow
$color4 = rgb(7aa2f7)    # Blue
$color5 = rgb(bb9af7)    # Magenta
$color6 = rgb(7dcfff)    # Cyan
$color7 = rgb(a9b1d6)    # White
```

**4. 背景画像の追加**

```bash
cp ~/Pictures/my-wallpaper.jpg ~/.config/omarchy/mytheme/backgrounds/
```

背景は`Super + Ctrl + Space`でローテーションできます。

## Hyprlandのカスタマイズ

Hyprlandはタイルウィンドウマネージャーです。設定ファイルで動作を細かく調整できます。

### 設定ファイル

```bash
nvim ~/.config/hypr/hyprland.conf
```

### キーバインドの追加

```bash
# ~/.config/hypr/hyprland.conf

# アプリケーション起動
bind = $mainMod SHIFT, S, exec, spotify
bind = $mainMod SHIFT, M, exec, slack

# カスタムスクリプト
bind = $mainMod, P, exec, ~/.local/bin/screenshot.sh

# ウィンドウ操作
bind = $mainMod CTRL, Left, resizeactive, -50 0
bind = $mainMod CTRL, Right, resizeactive, 50 0
```

### 変数定義

```bash
# ~/.config/hypr/hyprland.conf

$mainMod = SUPER
$terminal = ghostty
$browser = zen-browser
$filemanager = nautilus
```

### ウィンドウルール

特定のアプリケーションに対してルールを設定できます：

```bash
# ~/.config/hypr/hyprland.conf

# Spotifyは常にワークスペース9に
windowrulev2 = workspace 9, class:^(Spotify)$

# 1Passwordは浮動ウィンドウ
windowrulev2 = float, class:^(1Password)$
windowrulev2 = size 800 600, class:^(1Password)$
windowrulev2 = center, class:^(1Password)$

# 画像ビューアは浮動
windowrulev2 = float, class:^(imv)$
```

### アニメーション設定

```bash
# ~/.config/hypr/hyprland.conf

animations {
    enabled = yes

    bezier = myBezier, 0.05, 0.9, 0.1, 1.05

    animation = windows, 1, 7, myBezier
    animation = windowsOut, 1, 7, default, popin 80%
    animation = border, 1, 10, default
    animation = fade, 1, 7, default
    animation = workspaces, 1, 6, default
}
```

### マルチモニター設定

```bash
# ~/.config/hypr/monitors.conf

# メインモニター（4K、スケール2倍）
monitor = DP-1, 3840x2160@144, 0x0, 2

# サブモニター（右側に配置）
monitor = HDMI-A-1, 1920x1080@60, 1920x0, 1

# モニター検出時のデフォルト
monitor = , preferred, auto, 1
```

### 入力設定

```bash
# ~/.config/hypr/input.conf

input {
    kb_layout = jp
    kb_options = ctrl:nocaps    # CapsLockをCtrlに

    follow_mouse = 1

    touchpad {
        natural_scroll = yes
        tap-to-click = yes
        drag_lock = yes
    }

    sensitivity = 0
}
```

## Waybar（トップバー）のカスタマイズ

Waybarは画面上部のステータスバーです。

### 設定ファイル

```bash
nvim ~/.config/waybar/config.jsonc
```

### モジュールの追加

```jsonc
// ~/.config/waybar/config.jsonc
{
    "layer": "top",
    "position": "top",
    "height": 30,

    "modules-left": ["hyprland/workspaces", "hyprland/window"],
    "modules-center": ["clock"],
    "modules-right": ["pulseaudio", "network", "cpu", "memory", "battery", "tray"],

    "clock": {
        "format": "{:%Y-%m-%d %H:%M}",
        "tooltip-format": "<tt>{calendar}</tt>"
    },

    "cpu": {
        "format": "  {usage}%",
        "interval": 1
    },

    "memory": {
        "format": "  {}%"
    },

    "battery": {
        "format": "{icon}  {capacity}%",
        "format-icons": ["", "", "", "", ""]
    },

    "network": {
        "format-wifi": "  {signalStrength}%",
        "format-ethernet": "  {ipaddr}",
        "format-disconnected": "⚠  Disconnected"
    }
}
```

### スタイルのカスタマイズ

```css
/* ~/.config/waybar/style.css */

* {
    font-family: "JetBrainsMono Nerd Font";
    font-size: 13px;
}

window#waybar {
    background: rgba(26, 27, 38, 0.9);
    color: #c0caf5;
}

#workspaces button {
    padding: 0 5px;
    color: #565f89;
}

#workspaces button.active {
    color: #7aa2f7;
    border-bottom: 2px solid #7aa2f7;
}

#clock, #battery, #cpu, #memory, #network {
    padding: 0 10px;
}
```

## Starship（シェルプロンプト）

Starshipはクロスシェル対応の高速プロンプトです。

### 設定ファイル

```bash
nvim ~/.config/starship.toml
```

### カスタム設定例

```toml
# ~/.config/starship.toml

format = """
$username\
$hostname\
$directory\
$git_branch\
$git_status\
$nodejs\
$python\
$rust\
$docker_context\
$time\
$line_break\
$character"""

[character]
success_symbol = "[❯](bold green)"
error_symbol = "[❯](bold red)"

[directory]
truncation_length = 3
truncate_to_repo = true
style = "bold cyan"

[git_branch]
symbol = " "
style = "bold purple"

[git_status]
conflicted = "⚔️ "
ahead = "⬆️ ${count}"
behind = "⬇️ ${count}"
diverged = "⬆️ ${ahead_count}⬇️ ${behind_count}"
untracked = "📁 "
stashed = "📦 "
modified = "📝 "
staged = "➕ ${count}"
deleted = "🗑️ "

[nodejs]
symbol = " "

[python]
symbol = " "

[rust]
symbol = " "

[time]
disabled = false
format = "[$time]($style)"
time_format = "%H:%M"
style = "dimmed white"
```

## Ghostty（ターミナル）

Ghosttyはデフォルトのターミナルエミュレーターです。

### 設定ファイル

```bash
nvim ~/.config/ghostty/config
```

### カスタム設定例

```
# ~/.config/ghostty/config

# フォント
font-family = JetBrainsMono Nerd Font
font-size = 14

# 透明度
background-opacity = 0.95

# カーソル
cursor-style = block
cursor-style-blink = true

# スクロールバック
scrollback-limit = 10000

# キーバインド
keybind = ctrl+shift+c=copy_to_clipboard
keybind = ctrl+shift+v=paste_from_clipboard
keybind = ctrl+plus=increase_font_size:1
keybind = ctrl+minus=decrease_font_size:1
```

## セキュリティ設定

### 指紋認証の設定

```bash
# Omarchyメニューから
Super + Alt + Space → Setup → Security → Fingerprint
```

または手動で：

```bash
# 指紋登録
fprintd-enroll

# PAM設定
sudo nvim /etc/pam.d/system-local-login
```

### FIDO2キーの設定

```bash
# Omarchyメニューから
Super + Alt + Space → Setup → Security → Fido2
```

### ファイアウォールの確認

```bash
# ステータス確認
sudo ufw status

# 有効化（デフォルトで有効）
sudo ufw enable
```

## スナップショットとバックアップ

### 自動スナップショット

Omarchyはアップデート前に自動でスナップショットを作成します。

```bash
# 手動でスナップショット作成
omarchy-snapshot create "before-config-change"

# スナップショット一覧
omarchy-snapshot list

# 復元
omarchy-snapshot restore
```

### Dotfilesのバックアップ

設定ファイルをGitで管理することを推奨します：

```bash
# dotfilesリポジトリ作成
mkdir ~/dotfiles
cd ~/dotfiles
git init

# シンボリックリンクで管理
ln -s ~/.config/hypr ~/dotfiles/hypr
ln -s ~/.config/nvim ~/dotfiles/nvim
ln -s ~/.config/starship.toml ~/dotfiles/starship.toml

# コミット
git add .
git commit -m "Initial dotfiles"
```

## トラブルシューティング

### 設定を初期化したい場合

```bash
# Omarchy設定を再インストール
omarchy-reinstall
```

### ディスプレイスケールの問題

4Kディスプレイで文字が小さすぎる場合：

```bash
# ~/.config/hypr/hyprland.conf
env = GDK_SCALE,2
env = QT_SCALE_FACTOR,2
```

### キーボードレイアウトの変更

```bash
# ~/.config/hypr/input.conf
input {
    kb_layout = jp,us
    kb_options = grp:alt_shift_toggle
}
```

### ログの確認

```bash
# Hyprlandログ
cat ~/.local/share/hyprland/hyprland.log

# システムログ
journalctl -xe
```

## まとめ

Omarchyのカスタマイズポイントを振り返ります：

| 対象 | 設定ファイル |
|------|--------------|
| **Hyprland** | `~/.config/hypr/hyprland.conf` |
| **入力デバイス** | `~/.config/hypr/input.conf` |
| **モニター** | `~/.config/hypr/monitors.conf` |
| **Waybar** | `~/.config/waybar/config.jsonc` |
| **Starship** | `~/.config/starship.toml` |
| **Ghostty** | `~/.config/ghostty/config` |
| **テーマ** | `~/.config/omarchy/[テーマ名]/` |

Omarchyは**「意見を持った（Opinionated）」**ディストリビューションですが、これらの設定ファイルを編集することで自分好みの環境を構築できます。

設定を変更したらスナップショットを作成しておくと、問題発生時にすぐ戻せるので安心です。

## シリーズまとめ

この3部構成のガイドで、Omarchyの基本から上級テクニックまでカバーしました：

- **[Part 1](/blog/omarchy-guide-part1-introduction)**: インストールと基本操作
- **[Part 2](/blog/omarchy-guide-part2-workflow)**: 開発ワークフローの効率化
- **[Part 3](/blog/omarchy-guide-part3-customization)**: カスタマイズと上級設定

Omarchyで快適な開発ライフを！

## 参考リンク

- [Omarchy公式サイト](https://omarchy.org/)
- [Omarchyマニュアル](https://learn.omacom.io/)
- [Hyprland Wiki](https://wiki.hyprland.org/)
- [Waybar Wiki](https://github.com/Alexays/Waybar/wiki)
- [Starship公式](https://starship.rs/)
- [Awesome Omarchy](https://github.com/aorumbayev/awesome-omarchy)
