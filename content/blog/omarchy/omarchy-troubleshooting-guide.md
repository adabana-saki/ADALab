---
title: "【2025年版】Omarchyトラブルシューティング集 - よくある問題と解決法"
date: "2025-11-29"
description: "Omarchyで発生しやすい問題と解決方法を初心者にもわかりやすく解説。インストール、起動、ディスプレイ、日本語入力、アップデートなどのトラブルを網羅します。"
tags: ["Omarchy", "Linux", "トラブルシューティング", "問題解決", "初心者向け"]
author: "Adabana Saki"
draft: true
---

# Omarchyトラブルシューティング集 - よくある問題と解決法

Omarchyを使っていると、様々な問題に遭遇することがあります。

この記事では、**よくある問題とその解決方法**を初心者にもわかりやすく解説します。

## 目次

1. [インストール時の問題](#インストール時の問題)
2. [起動時の問題](#起動時の問題)
3. [ディスプレイ・グラフィックの問題](#ディスプレイグラフィックの問題)
4. [日本語入力の問題](#日本語入力の問題)
5. [ネットワークの問題](#ネットワークの問題)
6. [アップデートの問題](#アップデートの問題)
7. [アプリケーションの問題](#アプリケーションの問題)
8. [設定の問題](#設定の問題)

---

## インストール時の問題

### USBから起動できない

**症状**: USBを挿してもOmarchyのインストーラーが起動しない

**原因と解決方法**:

#### 1. Secure Bootが有効になっている

OmarchyはSecure Bootに対応していません。

```
【解決方法】
1. PCを再起動
2. BIOS/UEFIに入る（F2、F12、DELなど）
3. 「Security」または「Boot」メニューを探す
4. 「Secure Boot」を「Disabled」に変更
5. 保存して再起動
```

#### 2. TPMが有効になっている

TPMも無効化が必要な場合があります。

```
【解決方法】
1. BIOS/UEFIで「Security」メニューを探す
2. 「TPM」または「Trusted Platform Module」を「Disabled」に
3. 保存して再起動
```

#### 3. ブート順序が間違っている

```
【解決方法】
1. BIOS/UEFIで「Boot」メニューを探す
2. USBデバイスを最優先に設定
3. 保存して再起動
```

#### 4. USBの作成に失敗している

```
【解決方法】
- balenaEtcher または Rufus で再度書き込み
- 別のUSBメモリを試す
- ISOファイルを再ダウンロード
```

### インストール中にエラーが発生する

**症状**: インストール途中でエラーメッセージが表示される

#### ディスクが認識されない

```
【解決方法】
1. BIOS/UEFIでSATAモードを確認
2. 「RAID」モードなら「AHCI」に変更
3. NVMeの場合はファームウェアを最新に
```

#### ディスク容量が足りない

```
【解決方法】
- Omarchyには最低50GB以上を推奨
- 不要なパーティションを削除
- 別のドライブを使用
```

---

## 起動時の問題

### 黒い画面のまま起動しない

**症状**: ログイン画面が表示されず、黒い画面のまま

#### GPUドライバの問題

特にNVIDIA GPUで起こりやすい問題です。

```
【解決方法】
1. 起動時にGRUBメニューを表示（Shiftキー長押し）
2. カーネルパラメータに以下を追加:
   nomodeset
3. 一時的に起動したら、適切なドライバをインストール
```

NVIDIAドライバのインストール:

```bash
sudo pacman -S nvidia nvidia-utils
```

#### Hyprlandが起動しない

```bash
# ログを確認
cat ~/.local/share/hyprland/hyprland.log

# Hyprlandを手動で起動して確認
Hyprland
```

### ログイン後すぐにクラッシュする

**症状**: パスワード入力後、すぐにログイン画面に戻る

```
【解決方法】
1. Ctrl + Alt + F2 でTTYに切り替え
2. ログイン
3. 設定をリセット:
   omarchy-reinstall
4. 再起動:
   sudo reboot
```

---

## ディスプレイ・グラフィックの問題

### 画面がカクカクする・ティアリングが発生する

**症状**: スクロール時などに画面がちらつく

#### NVIDIA GPUの場合

```bash
# ~/.config/hypr/hyprland.conf に追加
env = LIBVA_DRIVER_NAME,nvidia
env = XDG_SESSION_TYPE,wayland
env = GBM_BACKEND,nvidia-drm
env = __GLX_VENDOR_LIBRARY_NAME,nvidia
env = WLR_NO_HARDWARE_CURSORS,1
```

#### AMD GPUの場合

```bash
# ~/.config/hypr/hyprland.conf に追加
env = WLR_DRM_NO_MODIFIERS,1
```

### 画面の解像度・スケーリングがおかしい

**症状**: 文字が小さすぎる、または大きすぎる

```bash
# モニター設定を確認
hyprctl monitors

# ~/.config/hypr/monitors.conf を編集
# 4Kディスプレイの例（スケール2倍）
monitor = DP-1, 3840x2160@60, 0x0, 2

# フルHDディスプレイの例
monitor = HDMI-A-1, 1920x1080@60, 0x0, 1
```

アプリケーション側のスケーリング:

```bash
# ~/.config/hypr/hyprland.conf に追加
env = GDK_SCALE,2
env = QT_SCALE_FACTOR,2
```

### 外部モニターが認識されない

```bash
# 接続されているモニターを確認
hyprctl monitors

# 手動でモニターを設定
# ~/.config/hypr/monitors.conf
monitor = HDMI-A-1, preferred, auto, 1
```

---

## 日本語入力の問題

### 日本語が入力できない

**症状**: 日本語入力に切り替えられない

#### fcitx5のインストールと設定

```bash
# fcitx5をインストール
sudo pacman -S fcitx5 fcitx5-mozc fcitx5-configtool fcitx5-gtk fcitx5-qt

# 環境変数を設定
# ~/.config/hypr/hyprland.conf に追加
env = GTK_IM_MODULE,fcitx
env = QT_IM_MODULE,fcitx
env = XMODIFIERS,@im=fcitx
env = SDL_IM_MODULE,fcitx
env = GLFW_IM_MODULE,ibus

# 自動起動を設定
# ~/.config/hypr/hyprland.conf に追加
exec-once = fcitx5 -d
```

#### 設定後の確認

```bash
# 再起動
sudo reboot

# fcitx5の設定ツールを起動
fcitx5-configtool
```

### 日本語フォントが表示されない（豆腐になる）

```bash
# 日本語フォントをインストール
sudo pacman -S noto-fonts-cjk noto-fonts-emoji

# フォントキャッシュを更新
fc-cache -fv
```

### キーボードレイアウトを日本語に変更したい

```bash
# ~/.config/hypr/input.conf を編集
input {
    kb_layout = jp
}
```

---

## ネットワークの問題

### Wi-Fiに接続できない

#### NetworkManagerを使用

```bash
# 利用可能なWi-Fiを確認
nmcli device wifi list

# Wi-Fiに接続
nmcli device wifi connect "SSID名" password "パスワード"

# 接続状態を確認
nmcli connection show
```

#### ドライバの問題

```bash
# ワイヤレスデバイスを確認
lspci | grep -i wireless

# よくあるドライバをインストール
# Intel
sudo pacman -S linux-firmware

# Broadcom
sudo pacman -S broadcom-wl
```

### 有線LANが認識されない

```bash
# ネットワークインターフェースを確認
ip link

# インターフェースを有効化
sudo ip link set eth0 up

# DHCPでIPを取得
sudo dhclient eth0
```

---

## アップデートの問題

### アップデート中にエラーが発生する

**症状**: `pacman`でエラーが出る

#### パッケージの競合

```bash
# パッケージデータベースを同期
sudo pacman -Syy

# 競合するパッケージを確認して削除
sudo pacman -R 問題のパッケージ

# 再度アップデート
sudo pacman -Syu
```

#### キーリングの問題

```bash
# キーリングを初期化
sudo pacman-key --init
sudo pacman-key --populate archlinux

# 再度アップデート
sudo pacman -Syu
```

#### ディスク容量不足

```bash
# 容量を確認
df -h

# キャッシュを削除
sudo pacman -Sc

# 孤立パッケージを削除
sudo pacman -Rns $(pacman -Qtdq)
```

### アップデート後に起動しなくなった

**症状**: アップデート後、システムが起動しない

#### スナップショットから復元

Omarchyは自動的にスナップショットを作成しています。

```
【復元方法】
1. 起動時にLimineブートメニューを表示
2. 「Snapshots」を選択
3. 問題発生前のスナップショットを選択
4. 起動
```

手動で復元:

```bash
# スナップショット一覧を確認
omarchy-snapshot list

# 復元
omarchy-snapshot restore
```

---

## アプリケーションの問題

### アプリケーションが起動しない

#### 依存関係の問題

```bash
# 依存関係を確認
ldd /path/to/application

# 不足しているライブラリをインストール
sudo pacman -S 必要なパッケージ
```

#### Waylandとの互換性問題

一部のアプリケーションはWaylandで動作しません。

```bash
# XWaylandを使用して起動
env XDG_SESSION_TYPE=x11 アプリケーション名

# または
env GDK_BACKEND=x11 アプリケーション名
```

### Electronアプリが正常に動作しない

VSCode、Slack、Discordなど：

```bash
# Waylandフラグを追加して起動
code --enable-features=UseOzonePlatform --ozone-platform=wayland

# または、環境変数を設定
env ELECTRON_OZONE_PLATFORM_HINT=auto code
```

永続的に設定:

```bash
# ~/.config/code-flags.conf
--enable-features=UseOzonePlatform
--ozone-platform=wayland
```

### Flatpakアプリケーションの問題

```bash
# Flatpakをインストール
sudo pacman -S flatpak

# アプリをインストール
flatpak install flathub アプリ名

# 権限の問題がある場合
flatpak override --user アプリID --filesystem=home
```

---

## 設定の問題

### 設定を初期状態に戻したい

```bash
# Omarchyの設定を再インストール
omarchy-reinstall

# これでデフォルト設定に戻ります
# 注意: カスタム設定は失われます
```

### キーバインドが効かない

```bash
# 設定ファイルを確認
nvim ~/.config/hypr/hyprland.conf

# Hyprlandをリロード
hyprctl reload

# または、設定の構文エラーを確認
Hyprland --config ~/.config/hypr/hyprland.conf
```

### テーマが反映されない

```bash
# テーマを再適用
# Super + Alt + Space → Appearance → Theme

# または手動で適用
omarchy-theme apply テーマ名
```

---

## ログの確認方法

問題が解決しない場合、ログを確認すると原因がわかることがあります。

### システムログ

```bash
# 最近のログを表示
journalctl -xe

# 起動時のログ
journalctl -b

# 特定のサービスのログ
journalctl -u サービス名
```

### Hyprlandのログ

```bash
cat ~/.local/share/hyprland/hyprland.log
```

### Xorgのログ（XWayland）

```bash
cat ~/.local/share/xorg/Xwayland.0.log
```

---

## ヘルプを求める方法

自分で解決できない場合は、コミュニティに助けを求めましょう。

### 情報を整理する

質問する前に、以下の情報を整理しておきましょう：

```bash
# Omarchyのバージョン
cat /etc/omarchy-release

# システム情報
uname -a

# GPU情報
lspci | grep -i vga

# エラーログ
journalctl -xe | tail -50
```

### サポートを求める場所

| 場所 | URL | 用途 |
|------|-----|------|
| **GitHub Discussions** | github.com/basecamp/omarchy/discussions | 質問・相談 |
| **GitHub Issues** | github.com/basecamp/omarchy/issues | バグ報告 |
| **Discord** | （公式サイトから参加） | リアルタイムの相談 |

### 質問のテンプレート

```
## 問題
[何が起きているか]

## 期待する動作
[どうなるべきか]

## 再現手順
1. [手順1]
2. [手順2]
3. [エラー発生]

## 環境
- Omarchyバージョン: [バージョン]
- GPU: [GPU名]
- モニター: [解像度]

## 試したこと
- [試したこと1]
- [試したこと2]

## ログ
```
[エラーログを貼り付け]
```
```

---

## まとめ

トラブルシューティングの基本的な流れ:

1. **問題を特定する** - 何が起きているか明確にする
2. **ログを確認する** - エラーメッセージを探す
3. **原因を調べる** - この記事やArch Wikiを参照
4. **解決策を試す** - 一つずつ試して結果を確認
5. **助けを求める** - 自分で解決できなければコミュニティへ

Omarchyはまだ新しいプロジェクトなので、問題に遭遇することもあります。

しかし、Arch Linuxベースなので、[Arch Wiki](https://wiki.archlinux.org/)の情報が多くの場合で役立ちます。

## 関連記事

- [Omarchy入門ガイド Part 1](/blog/omarchy-guide-part1-introduction)
- [Omarchyカスタマイズガイド Part 3](/blog/omarchy-guide-part3-customization)
- [Hyprland設定大全](/blog/hyprland-configuration-guide)

## 参考リンク

- [Omarchy GitHub](https://github.com/basecamp/omarchy)
- [Omarchy公式マニュアル](https://learn.omacom.io/)
- [Arch Wiki](https://wiki.archlinux.org/)
- [Hyprland Wiki](https://wiki.hypr.land/)
