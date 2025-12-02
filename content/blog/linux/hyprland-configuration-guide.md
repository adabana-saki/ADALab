---
title: "【2025年版】Hyprland設定大全 - タイルウィンドウマネージャーを使いこなす"
date: "2025-11-29"
publishDate: "2025-12-01"
description: "Hyprlandの設定方法を初心者にもわかりやすく解説。キーバインド、アニメーション、ウィンドウルール、マルチモニターなど網羅的にカバーします。"
tags: ["Hyprland", "Linux", "ウィンドウマネージャー", "カスタマイズ", "Omarchy"]
author: "Adabana Saki"
---

# Hyprland設定大全 - タイルウィンドウマネージャーを使いこなす

**Hyprland**（ハイパーランド）は、美しいアニメーションと高いカスタマイズ性を持つ**タイルウィンドウマネージャー**です。

OmarchyやArch Linuxで採用されており、正しく設定すれば非常に効率的な作業環境を構築できます。

この記事では、初心者にもわかりやすくHyprlandの設定方法を解説します。

## タイルウィンドウマネージャーとは？

まず、「タイルウィンドウマネージャー」について理解しましょう。

### 従来のウィンドウ管理

WindowsやMacでは、ウィンドウを**自由に配置**できます。

```
【従来のウィンドウ管理】
┌─────────────────────────────────────┐
│  ┌────────┐                         │
│  │ブラウザ│    ┌──────────┐         │
│  │        │    │エディタ  │         │
│  └────────┘    │          │         │
│        ┌───────┴──┐       │         │
│        │ターミナル│       │         │
│        └──────────┘───────┘         │
│                                     │
└─────────────────────────────────────┘
ウィンドウが重なったり、隙間ができたりする
```

### タイルウィンドウマネージャー

タイルウィンドウマネージャーでは、ウィンドウが**自動的に画面を分割**して配置されます。

```
【タイルウィンドウ管理】
┌─────────────────────────────────────┐
│ ブラウザ      │  エディタ           │
│               │                     │
│               ├─────────────────────┤
│               │  ターミナル         │
│               │                     │
└─────────────────────────────────────┘
ウィンドウが隙間なく並ぶ
```

**メリット:**
- 画面を無駄なく使える
- ウィンドウの配置に悩まない
- キーボードだけで操作できる

## 設定ファイルの場所

Hyprlandの設定ファイルは以下の場所にあります：

```
~/.config/hypr/hyprland.conf  ← メイン設定ファイル
```

Omarchyの場合、追加の設定ファイルがあります：

```
~/.config/hypr/
├── hyprland.conf     # メイン設定
├── input.conf        # キーボード・マウス設定
├── monitors.conf     # ディスプレイ設定
└── ...
```

### 設定ファイルの編集方法

```bash
# お好みのエディタで開く
nvim ~/.config/hypr/hyprland.conf

# または
code ~/.config/hypr/hyprland.conf
```

設定を変更したら、保存するだけで**即座に反映**されます（再起動不要）。

## 基本的な設定

### 変数の定義

よく使う値を変数として定義できます。

```bash
# ~/.config/hypr/hyprland.conf

# 修飾キーの定義（SUPERはWindowsキー/Commandキー）
$mainMod = SUPER

# よく使うアプリケーション
$terminal = ghostty
$browser = firefox
$fileManager = nautilus
```

### 設定値の種類

Hyprlandで使用する設定値の種類を理解しましょう。

| 種類 | 説明 | 例 |
|------|------|-----|
| **int** | 整数 | `5`, `100` |
| **bool** | 真偽値 | `true`, `false`, `yes`, `no`, `1`, `0` |
| **float** | 小数 | `0.5`, `1.0` |
| **color** | 色 | `rgb(ff0000)`, `rgba(ff000080)` |
| **str** | 文字列 | `"Hello"` |

## キーバインドの設定

キーバインドはHyprlandの核心部分です。

### 基本構文

```bash
bind = 修飾キー, キー, アクション, パラメータ
```

**例:**

```bash
# Super + Qでアクティブウィンドウを閉じる
bind = $mainMod, Q, killactive

# Super + Returnでターミナルを起動
bind = $mainMod, Return, exec, $terminal

# Super + Shift + Bでブラウザを起動
bind = $mainMod SHIFT, B, exec, $browser
```

### 修飾キーの種類

| 表記 | キー |
|------|------|
| `SUPER` | Windowsキー / Commandキー |
| `SHIFT` | Shiftキー |
| `CTRL` | Controlキー |
| `ALT` | Altキー |

複数の修飾キーを組み合わせる場合はスペースで区切ります：

```bash
# Super + Shift + Q
bind = $mainMod SHIFT, Q, exec, firefox
```

### よく使うアクション

#### ウィンドウ操作

```bash
# ウィンドウを閉じる
bind = $mainMod, Q, killactive

# フルスクリーン切り替え
bind = $mainMod, F, fullscreen

# 浮動/タイル切り替え
bind = $mainMod, T, togglefloating

# ウィンドウを中央に移動（浮動ウィンドウ）
bind = $mainMod, C, centerwindow
```

#### フォーカス移動

```bash
# 左右上下のウィンドウにフォーカス移動
bind = $mainMod, H, movefocus, l
bind = $mainMod, L, movefocus, r
bind = $mainMod, K, movefocus, u
bind = $mainMod, J, movefocus, d

# または矢印キーで
bind = $mainMod, Left, movefocus, l
bind = $mainMod, Right, movefocus, r
bind = $mainMod, Up, movefocus, u
bind = $mainMod, Down, movefocus, d
```

#### ウィンドウ移動

```bash
# ウィンドウを左右上下に移動
bind = $mainMod SHIFT, H, movewindow, l
bind = $mainMod SHIFT, L, movewindow, r
bind = $mainMod SHIFT, K, movewindow, u
bind = $mainMod SHIFT, J, movewindow, d
```

#### ワークスペース操作

```bash
# ワークスペース1〜9に切り替え
bind = $mainMod, 1, workspace, 1
bind = $mainMod, 2, workspace, 2
bind = $mainMod, 3, workspace, 3
# ... 以下同様

# ウィンドウを別のワークスペースに移動
bind = $mainMod SHIFT, 1, movetoworkspace, 1
bind = $mainMod SHIFT, 2, movetoworkspace, 2
# ... 以下同様
```

### アプリケーション起動

```bash
# ターミナル
bind = $mainMod, Return, exec, $terminal

# ブラウザ
bind = $mainMod SHIFT, B, exec, firefox

# ファイルマネージャー
bind = $mainMod SHIFT, E, exec, nautilus

# アプリケーションランチャー
bind = $mainMod, Space, exec, rofi -show drun

# スクリーンショット
bind = , Print, exec, grim -g "$(slurp)" ~/Pictures/screenshot.png
```

### マウスバインド

マウス操作もカスタマイズできます。

```bash
# Super + 左クリックでウィンドウを移動
bindm = $mainMod, mouse:272, movewindow

# Super + 右クリックでウィンドウをリサイズ
bindm = $mainMod, mouse:273, resizewindow
```

## ウィンドウルール

特定のアプリケーションに対して、自動的にルールを適用できます。

### 基本構文

```bash
windowrulev2 = ルール, 条件
```

### よく使う条件

| 条件 | 説明 | 例 |
|------|------|-----|
| `class:` | アプリケーションのクラス名 | `class:^(firefox)$` |
| `title:` | ウィンドウのタイトル | `title:^(設定)$` |

クラス名を調べるには：

```bash
hyprctl clients
```

### 実用的な設定例

```bash
# Spotifyは常にワークスペース9で開く
windowrulev2 = workspace 9, class:^(Spotify)$

# 1Passwordは浮動ウィンドウで中央に
windowrulev2 = float, class:^(1Password)$
windowrulev2 = size 800 600, class:^(1Password)$
windowrulev2 = center, class:^(1Password)$

# 画像ビューアは浮動
windowrulev2 = float, class:^(imv)$
windowrulev2 = float, class:^(feh)$

# Discordはワークスペース8
windowrulev2 = workspace 8, class:^(discord)$

# ファイル選択ダイアログは浮動
windowrulev2 = float, title:^(Open File)$
windowrulev2 = float, title:^(Save As)$
```

### 利用可能なルール

| ルール | 説明 |
|--------|------|
| `float` | 浮動ウィンドウにする |
| `tile` | タイルウィンドウにする |
| `fullscreen` | フルスクリーンで開く |
| `maximize` | 最大化して開く |
| `size W H` | サイズを指定 |
| `center` | 画面中央に配置 |
| `workspace N` | 指定ワークスペースで開く |
| `opacity X` | 透明度を設定（0.0〜1.0） |
| `nofocus` | フォーカスを奪わない |

## アニメーション設定

Hyprlandの魅力の一つが、美しいアニメーションです。

### 基本構文

```bash
animations {
    enabled = yes

    # ベジェ曲線を定義
    bezier = myBezier, 0.05, 0.9, 0.1, 1.05

    # アニメーションを定義
    animation = windows, 1, 7, myBezier
    animation = windowsOut, 1, 7, default, popin 80%
    animation = fade, 1, 7, default
    animation = workspaces, 1, 6, default
}
```

### ベジェ曲線とは？

ベジェ曲線は、アニメーションの「動き方」を定義します。

```
【ベジェ曲線のイメージ】

速度
 ↑
 │    ____
 │   /    ＼    ← 最初はゆっくり、中間で速く、最後にゆっくり
 │  /      ＼
 │ /        ＼
 └─────────────→ 時間
```

```bash
# 定義: bezier = 名前, x1, y1, x2, y2
bezier = myBezier, 0.05, 0.9, 0.1, 1.05
```

### プリセットのベジェ曲線

```bash
# スムーズ（滑らか）
bezier = smooth, 0.25, 0.1, 0.25, 1.0

# バウンス（跳ねる）
bezier = bounce, 0.68, -0.55, 0.265, 1.55

# スナップ（素早い）
bezier = snap, 0.4, 0, 0.2, 1
```

### アニメーションの種類

| 名前 | 対象 |
|------|------|
| `windows` | ウィンドウの出現 |
| `windowsOut` | ウィンドウの消失 |
| `fade` | フェードイン/アウト |
| `border` | ボーダーの色変化 |
| `workspaces` | ワークスペース切り替え |

### 設定例

```bash
animations {
    enabled = yes

    # カスタムベジェ曲線
    bezier = overshot, 0.05, 0.9, 0.1, 1.1
    bezier = smooth, 0.5, 0, 0.99, 0.99

    # ウィンドウアニメーション
    animation = windows, 1, 4, overshot, slide
    animation = windowsOut, 1, 4, smooth, slide
    animation = windowsMove, 1, 4, smooth

    # フェード
    animation = fade, 1, 4, smooth

    # ボーダー
    animation = border, 1, 10, default

    # ワークスペース
    animation = workspaces, 1, 5, overshot, slidevert
}
```

### アニメーションを無効化

パフォーマンスを優先したい場合：

```bash
animations {
    enabled = no
}
```

## マルチモニター設定

複数のディスプレイを使用する場合の設定です。

### モニターの確認

まず、接続されているモニターを確認します：

```bash
hyprctl monitors
```

出力例：
```
Monitor DP-1 (ID 0):
    3840x2160@144.00000 at 0x0
    ...

Monitor HDMI-A-1 (ID 1):
    1920x1080@60.00000 at 3840x0
    ...
```

### 基本設定

```bash
# ~/.config/hypr/monitors.conf

# 書式: monitor = 名前, 解像度@リフレッシュレート, 位置, スケール

# メインモニター（4K、スケール2倍）
monitor = DP-1, 3840x2160@144, 0x0, 2

# サブモニター（右側に配置）
monitor = HDMI-A-1, 1920x1080@60, 1920x0, 1
```

### 位置の指定

位置は `x座標 x y座標` で指定します。

```
【モニター配置例】

      (0, 0)                    (1920, 0)
         ┌───────────────────┬───────────────────┐
         │                   │                   │
         │   メインモニター    │   サブモニター     │
         │    1920x1080      │    1920x1080      │
         │                   │                   │
         └───────────────────┴───────────────────┘
```

```bash
monitor = DP-1, 1920x1080@60, 0x0, 1
monitor = HDMI-A-1, 1920x1080@60, 1920x0, 1
```

### 縦配置

```bash
# 上下に配置
monitor = DP-1, 1920x1080@60, 0x0, 1
monitor = HDMI-A-1, 1920x1080@60, 0x1080, 1
```

### 自動設定

接続されたモニターを自動検出する場合：

```bash
monitor = , preferred, auto, 1
```

### ワークスペースの割り当て

特定のモニターにワークスペースを割り当て：

```bash
# ワークスペース1〜5をメインモニターに
workspace = 1, monitor:DP-1
workspace = 2, monitor:DP-1
workspace = 3, monitor:DP-1
workspace = 4, monitor:DP-1
workspace = 5, monitor:DP-1

# ワークスペース6〜10をサブモニターに
workspace = 6, monitor:HDMI-A-1
workspace = 7, monitor:HDMI-A-1
workspace = 8, monitor:HDMI-A-1
workspace = 9, monitor:HDMI-A-1
workspace = 10, monitor:HDMI-A-1
```

## 入力デバイスの設定

キーボードやマウスの設定です。

### キーボード設定

```bash
input {
    # キーボードレイアウト
    kb_layout = jp
    # または複数レイアウト
    # kb_layout = jp, us

    # レイアウト切り替えのショートカット
    # kb_options = grp:alt_shift_toggle

    # CapsLockをCtrlにする
    kb_options = ctrl:nocaps

    # キーリピート設定
    repeat_rate = 50
    repeat_delay = 300
}
```

### マウス・トラックパッド設定

```bash
input {
    # マウスがフォーカスに追従
    follow_mouse = 1

    # マウス感度（-1.0〜1.0）
    sensitivity = 0

    # トラックパッド設定
    touchpad {
        # ナチュラルスクロール
        natural_scroll = yes

        # タップでクリック
        tap-to-click = yes

        # 二本指タップで右クリック
        tap_button_map = lrm

        # ドラッグロック
        drag_lock = yes
    }
}
```

## 見た目のカスタマイズ

### 一般設定

```bash
general {
    # ウィンドウ間のギャップ
    gaps_in = 5
    gaps_out = 10

    # ボーダーの太さ
    border_size = 2

    # アクティブウィンドウのボーダー色
    col.active_border = rgba(7aa2f7ff)

    # 非アクティブウィンドウのボーダー色
    col.inactive_border = rgba(565f89aa)

    # レイアウト（dwindleまたはmaster）
    layout = dwindle
}
```

### 装飾設定

```bash
decoration {
    # 角の丸み
    rounding = 10

    # 透明度
    active_opacity = 1.0
    inactive_opacity = 0.9

    # ぼかし効果
    blur {
        enabled = true
        size = 8
        passes = 2
        new_optimizations = true
    }

    # 影
    shadow {
        enabled = true
        range = 20
        render_power = 3
        color = rgba(1a1a1aee)
    }
}
```

## トラブルシューティング

### 設定が反映されない

1. 設定ファイルの構文エラーを確認：
   ```bash
   hyprctl reload
   ```

2. エラーログを確認：
   ```bash
   cat ~/.local/share/hyprland/hyprland.log
   ```

### ウィンドウのクラス名がわからない

```bash
hyprctl clients
```

### キーの名前がわからない

```bash
# キーを押すと名前が表示される
wev
```

または：

```bash
xev  # X11互換モード
```

### 設定をリセットしたい

```bash
# バックアップを取ってから
cp ~/.config/hypr/hyprland.conf ~/.config/hypr/hyprland.conf.backup

# デフォルト設定をコピー
cp /usr/share/hyprland/hyprland.conf ~/.config/hypr/hyprland.conf
```

## おすすめの設定例

### ミニマルな設定

```bash
$mainMod = SUPER

# 基本操作
bind = $mainMod, Return, exec, kitty
bind = $mainMod, Q, killactive
bind = $mainMod, Space, exec, rofi -show drun

# フォーカス移動
bind = $mainMod, H, movefocus, l
bind = $mainMod, L, movefocus, r
bind = $mainMod, K, movefocus, u
bind = $mainMod, J, movefocus, d

# ワークスペース
bind = $mainMod, 1, workspace, 1
bind = $mainMod, 2, workspace, 2
bind = $mainMod, 3, workspace, 3

# マウス操作
bindm = $mainMod, mouse:272, movewindow
bindm = $mainMod, mouse:273, resizewindow

# 見た目
general {
    gaps_in = 5
    gaps_out = 10
    border_size = 2
}

animations {
    enabled = yes
}
```

## まとめ

Hyprlandの主要な設定項目をまとめます：

| 項目 | ファイル/セクション |
|------|-------------------|
| キーバインド | `bind = ...` |
| ウィンドウルール | `windowrulev2 = ...` |
| アニメーション | `animations { }` |
| モニター | `monitor = ...` |
| 入力デバイス | `input { }` |
| 見た目 | `general { }`, `decoration { }` |

設定は保存するだけで即座に反映されるので、少しずつ調整しながら自分好みの環境を作っていきましょう。

## 関連記事

- [Omarchy入門ガイド Part 1](/blog/omarchy-guide-part1-introduction)
- [Omarchyカスタマイズガイド Part 3](/blog/omarchy-guide-part3-customization)

## 参考リンク

- [Hyprland公式Wiki](https://wiki.hypr.land/)
- [Hyprland GitHub](https://github.com/hyprwm/Hyprland)
- [Hyprlandキーバインド設定](https://wiki.hypr.land/Configuring/Binds/)
- [Hyprlandアニメーション設定](https://wiki.hypr.land/Configuring/Animations/)
