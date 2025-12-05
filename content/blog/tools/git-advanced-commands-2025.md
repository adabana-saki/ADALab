---
title: "【Git中級者への道】知ってると得する発展Gitコマンド集2025｜cherry-pick・rebase・stash完全理解"
date: "2025-12-06"
publishDate: "2025-12-09"
description: "git cherry-pick、rebase、stashなど、知っていると開発効率が劇的に上がるGitコマンドを図解で丁寧に解説。仕組みから理解できる。"
tags: ["Git", "GitHub", "中級者", "チートシート", "開発ツール", "rebase", "cherry-pick"]
author: "Adabana Saki"
---

# 知ってると得する発展Gitコマンド集2025

「git add、commit、push は分かった。でも、もっと便利に使えないの？」

そう思ったあなたは、次のステップに進む準備ができています。

この記事では、**知っていると開発効率が劇的に上がる**Gitコマンドを紹介します。cherry-pick、rebase、stashなど、名前だけ聞くと難しそうですが、**仕組みはとてもシンプル**です。

「どういうロジックで動くのか」を図解で丁寧に説明するので、安心して読み進めてください。

> 基本コマンドをまだ覚えていない方は、まず[【超初心者向け】Gitコマンド完全チートシート2025](/blog/git-command-cheat-sheet-2025)をご覧ください。

## この記事で学べるコマンド

| コマンド | 一言で言うと | 使う場面 |
|----------|-------------|----------|
| `git stash` | 作業を一時退避 | 急な割り込み対応 |
| `git cherry-pick` | 特定コミットだけ取り込む | 必要な変更だけ欲しい時 |
| `git rebase` | 履歴を直線的に整理 | きれいな履歴にしたい時 |
| `git revert` | 打ち消しコミットを作る | 安全に取り消したい時 |
| `git bisect` | バグ発生地点を特定 | どこで壊れたか調べたい時 |
| `git reflog` | 操作履歴を見る | やらかした時の復旧 |
| `git worktree` | 複数ブランチを同時作業 | 並行作業したい時 |

それでは、一つずつ見ていきましょう。

## git stash - 作業を一時退避する

### どういうロジック？

**stash（スタッシュ）は「一時退避ボックス」です。**

作業中の変更を一旦しまっておいて、後で取り出せます。

```
【stashのイメージ】

作業フォルダ              一時退避ボックス
┌─────────────────┐       ┌─────────────────┐
│ 編集中のファイル  │ ───→ │ stash@{0}       │ ← 最新
│ まだコミット前... │       │ stash@{1}       │ ← 1つ前
└─────────────────┘       │ stash@{2}       │
     git stash            └─────────────────┘
                            後で取り出せる
```

### 実践シナリオ

> 「新機能を開発中に、緊急のバグ修正依頼が来た！」

こんな時、stashが活躍します。

```bash
# 1. 今の作業を一時退避
git stash

# 2. mainブランチに切り替えてバグ修正
git switch main
# （バグ修正してコミット）

# 3. 元のブランチに戻る
git switch feature/new-function

# 4. 退避した作業を復元
git stash pop
```

### コマンド一覧

| コマンド | 何をする |
|---------|----------|
| `git stash` | 作業を退避（メッセージなし） |
| `git stash push -m "メッセージ"` | メッセージ付きで退避 |
| `git stash list` | 退避した一覧を見る |
| `git stash pop` | 最新を取り出して削除 |
| `git stash apply` | 最新を取り出す（削除しない） |
| `git stash drop` | 最新を削除 |

**popとapplyの違い**: popは取り出したら消える、applyは残る。applyは「念のため残しておきたい」時に使います。

## git cherry-pick - 特定のコミットだけ取り込む

### どういうロジック？

**cherry-pick（チェリーピック）は「つまみ食い」です。**

別のブランチから、欲しいコミットだけを選んで持ってこれます。

```
【cherry-pickのイメージ】

feature ●──●──●──●
               ↑
               │ このバグ修正だけ欲しい！
               │
main    ●──●──●
               │
               ▼
        ●──●──●──●  ← コピーされた
```

### 実践シナリオ

> 「featureブランチで作ったバグ修正を、先にmainに適用したい」

```bash
# 1. 取り込みたいコミットのハッシュを確認
git log feature/login --oneline
# 出力: a1b2c3d バグ修正: ログイン時のエラー処理

# 2. mainブランチに移動
git switch main

# 3. 特定のコミットだけ取り込む
git cherry-pick a1b2c3d
```

### コマンド

```bash
# 1つのコミットを取り込む
git cherry-pick <commit-hash>

# 複数のコミットを取り込む
git cherry-pick <hash1> <hash2> <hash3>

# コンフリクトが起きた場合
git cherry-pick --continue  # 解決後に続行
git cherry-pick --abort     # 中止して元に戻す
```

## git rebase - 履歴を直線的に整理する

### どういうロジック？

**rebase（リベース）は「履歴の付け替え」です。**

mergeとの違いを図で見てみましょう。

```
【merge vs rebase】

■ merge（マージ）: 履歴が分岐したまま残る
main    ●──●──●──────●（マージコミット）
             ＼      ／
feature       ●──●──●

■ rebase（リベース）: 直線的な履歴になる
main    ●──●──●
                ＼
feature          ●──●──●  ← mainの先端に移動

→ 最終的に
main    ●──●──●──●──●──●  ← きれいな一直線
```

### いつ使う？

- **merge**: チームで作業している時（履歴を残したい）
- **rebase**: 個人の作業ブランチを整理したい時

### コマンド

```bash
# featureブランチにいる状態で、mainの最新に追従
git rebase main

# コンフリクトが起きた場合
git rebase --continue  # 解決後に続行
git rebase --abort     # 中止して元に戻す
```

### インタラクティブrebase（コミットをまとめる）

細かく分けすぎたコミットを1つにまとめたい時に使います。

```bash
# 直近3つのコミットを編集
git rebase -i HEAD~3
```

エディタが開いて、こんな画面が出ます：

```
pick a1b2c3d 機能A追加
pick d4e5f6g 機能Aの修正
pick h7i8j9k 機能Aのタイポ修正

# pickをsquashに変えると、1つ上のコミットと統合される
```

```
pick a1b2c3d 機能A追加
squash d4e5f6g 機能Aの修正
squash h7i8j9k 機能Aのタイポ修正

# → 3つのコミットが1つにまとまる
```

### 重要な注意点

**公開済み（pushした）コミットはrebaseしない！**

rebaseすると履歴が書き換わるため、他の人の作業と衝突します。rebaseは**自分だけの作業ブランチ**で使いましょう。

## git revert - 安全に取り消す

### どういうロジック？

**revert（リバート）は「打ち消しコミット」を作ります。**

resetとの違いを図で見てみましょう。

```
【reset vs revert】

■ reset: 履歴を消す（危険！）
●──●──●──●  →  ●──●──●
         ↑ 消える

■ revert: 打ち消しコミットを追加（安全）
●──●──●──●  →  ●──●──●──●──●
         ↑              ↑
       問題の         取り消す
       コミット       コミット
```

### いつ使う？

- **reset**: まだpushしていないコミットを取り消したい
- **revert**: すでにpushしたコミットを安全に取り消したい

revertは履歴を消さないので、チーム開発でも安心して使えます。

### コマンド

```bash
# 特定のコミットを取り消す
git revert <commit-hash>

# 直前のコミットを取り消す
git revert HEAD

# 複数のコミットを取り消す
git revert <hash1> <hash2>
```

## git bisect - バグの発生地点を特定する

### どういうロジック？

**bisect（バイセクト）は「二分探索」でバグを見つけます。**

「ここは動いてた」「ここはバグってる」の間を自動で絞り込んでくれます。

```
【bisectのイメージ】

●──●──●──●──●──●──●──●
↑                       ↑
ここは正常              ここはバグ
（good）                （bad）

         ↓ 中間をチェック

●──●──●──●──●──●──●──●
            ↑
         これは正常？バグ？

         ↓ 繰り返し

●──●──●──●──●──●──●──●
               ↑
         ここでバグが入った！
```

100コミットあっても、7回程度の確認で特定できます（log₂100 ≈ 7）。

### コマンド

```bash
# 1. bisect開始
git bisect start

# 2. 今の状態はバグ
git bisect bad

# 3. このコミットは正常だった
git bisect good <commit-hash>

# 4. Gitが中間のコミットに移動してくれる
#    → 動作確認して good か bad を入力
git bisect good  # または git bisect bad

# 5. 原因のコミットが特定されたら終了
git bisect reset
```

## git reflog - 全ての操作履歴を見る

### どういうロジック？

**reflog（リフログ）は「Gitの操作履歴」です。**

`git log`はコミット履歴だけですが、reflogは**全ての操作**を記録しています。

```
【logとreflogの違い】

■ git log: コミットの履歴
●──●──●  ← これだけ見える

■ git reflog: 操作の履歴
a1b2c3d HEAD@{0}: commit: 機能追加
d4e5f6g HEAD@{1}: reset: moving to HEAD~1
h7i8j9k HEAD@{2}: commit: 消えたはずのコミット ← これも見える！
```

### いつ使う？

**「やらかした！」時の最終手段です。**

- `reset --hard`で消してしまったコミットを復元
- 間違えてブランチを削除してしまった
- rebaseで履歴がおかしくなった

### コマンド

```bash
# 操作履歴を見る
git reflog

# 出力例
a1b2c3d HEAD@{0}: commit: 最新のコミット
d4e5f6g HEAD@{1}: reset: moving to HEAD~1
h7i8j9k HEAD@{2}: commit: 消してしまったコミット

# 消えたコミットを復元
git reset --hard h7i8j9k
```

**reflogがあるので、Gitでは「完全に消える」ことはほぼありません。** 安心してください。

## git worktree - 複数ブランチを同時に作業

### どういうロジック？

**worktree（ワークツリー）は「ブランチごとにフォルダを分ける」機能です。**

通常、ブランチを切り替えるとファイルの内容が変わりますが、worktreeを使うと**別フォルダとして両方を開ける**ようになります。

```
【worktreeのイメージ】

普通の方法:
my-project/
└── （mainかfeatureか、どちらか一方）

worktreeを使う:
my-project/           ← mainブランチ
my-project-feature/   ← featureブランチ
                        同時に両方開ける！
```

### いつ使う？

- レビュー中のコードと自分の作業を同時に見たい
- 2つの機能を並行して開発したい
- ビルドに時間がかかるプロジェクトで切り替えを避けたい

### コマンド

```bash
# worktreeを作成
git worktree add ../my-project-feature feature/login

# worktreeの一覧を見る
git worktree list

# worktreeを削除
git worktree remove ../my-project-feature
```

## 状況別「どれを使う？」早見表

| こうしたい | 使うコマンド |
|-----------|-------------|
| 作業を一時中断したい | `git stash` |
| 特定のコミットだけ欲しい | `git cherry-pick` |
| 履歴をきれいにしたい | `git rebase` |
| 公開済みの変更を取り消したい | `git revert` |
| いつからバグってた？ | `git bisect` |
| やらかしを復旧したい | `git reflog` |
| 2つのブランチを同時に見たい | `git worktree` |

## よくある失敗と復旧方法

### rebase中にコンフリクトで詰まった

```bash
# 「もう分からない！やめたい！」という時
git rebase --abort  # すべて元に戻る
```

### 間違えて reset --hard した

```bash
# reflogで操作履歴を確認
git reflog

# 消えたコミットを見つけて復元
git reset --hard <消えたコミットのハッシュ>
```

### cherry-pickでコンフリクト

```bash
# コンフリクトを手動で解決した後
git add .
git cherry-pick --continue

# やっぱりやめたい時
git cherry-pick --abort
```

## まとめ

今回紹介したコマンドをもう一度おさらいします。

```
【知ってると得するコマンド】

git stash       ← 作業を一時退避
git cherry-pick ← 特定コミットだけ取り込む
git rebase      ← 履歴を直線的に整理
git revert      ← 安全に取り消す
git bisect      ← バグの発生地点を特定
git reflog      ← やらかした時の復旧
git worktree    ← 複数ブランチを同時作業
```

**全部を今すぐ覚える必要はありません。**

「こういう時に使えるコマンドがあるんだな」と頭の片隅に入れておいて、必要な時にこのページに戻ってくれば大丈夫です。

## シリーズリンク

- [第1弾：【超初心者向け】Gitコマンド完全チートシート2025](/blog/git-command-cheat-sheet-2025) - 基本に戻りたい方はこちら
- [第3弾：特殊コマンド＆CI/CD入門2025](/blog/git-cicd-practical-guide-2025) - tag、hooks、GitHub Actionsで自動化

一緒にGitを使いこなしていきましょう。

## 参考リンク

- [Git公式ドキュメント](https://git-scm.com/doc)
- [Pro Git - リベース](https://git-scm.com/book/ja/v2/Git-%E3%81%AE%E3%83%96%E3%83%A9%E3%83%B3%E3%83%81%E6%A9%9F%E8%83%BD-%E3%83%AA%E3%83%99%E3%83%BC%E3%82%B9)
- [Atlassian Git Tutorial](https://www.atlassian.com/ja/git/tutorials)
