# ブログコンテンツ管理ガイド

このディレクトリでブログ記事を管理します。

## ディレクトリ構造

```
content/blog/
├── _config.yaml          # ブログ全体の設定
├── _series.yaml          # シリーズ（連載）の定義
├── _templates/           # 記事テンプレート
│   ├── default.md        # 基本テンプレート
│   ├── tutorial.md       # チュートリアル用
│   └── troubleshooting.md # トラブルシューティング用
│
├── omarchy/              # カテゴリー: Omarchy
│   ├── _category.yaml    # カテゴリー設定
│   └── *.md              # 記事ファイル
│
├── linux/                # カテゴリー: Linux
├── tools/                # カテゴリー: ツール
├── web/                  # カテゴリー: Web開発
└── general/              # カテゴリー: 一般
```

## 新しい記事を作成する

### 1. テンプレートをコピー

```bash
# 基本テンプレート
cp content/blog/_templates/default.md content/blog/カテゴリー/新しい記事.md

# チュートリアル
cp content/blog/_templates/tutorial.md content/blog/カテゴリー/新しい記事.md

# トラブルシューティング
cp content/blog/_templates/troubleshooting.md content/blog/カテゴリー/新しい記事.md
```

### 2. ファイル名のルール

- **英数字とハイフン**のみ使用（日本語不可）
- 例: `my-first-post.md`, `nextjs-tutorial-part1.md`

### 3. フロントマターを編集

```yaml
---
title: "記事タイトル"
date: "2025-01-01"
description: "記事の説明（検索結果に表示される）"
tags: ["タグ1", "タグ2"]
author: "ADA Lab"
# draft: true  # 下書きの場合
---
```

## カテゴリー

| カテゴリー | ディレクトリ | 内容 |
|-----------|-------------|------|
| Omarchy | `omarchy/` | Omarchy関連 |
| Linux | `linux/` | Linux全般 |
| ツール | `tools/` | 開発ツール |
| Web開発 | `web/` | フロントエンド・バックエンド |
| 一般 | `general/` | お知らせ・雑記 |

### 新しいカテゴリーを追加

1. ディレクトリを作成: `mkdir content/blog/新カテゴリー`
2. `_category.yaml`を作成:

```yaml
name: "カテゴリー名"
slug: "category-slug"
description: "カテゴリーの説明"
color: "#7aa2f7"
icon: "folder"
order: 10
```

## シリーズ（連載）

複数の記事をシリーズとしてまとめる場合:

### 1. `_series.yaml`に追加

```yaml
my-series:
  title: "シリーズタイトル"
  description: "シリーズの説明"
  posts:
    - カテゴリー/記事1
    - カテゴリー/記事2
    - カテゴリー/記事3
  level: "初心者"
  completed: false
```

### 2. 記事のフロントマターに追加（任意）

```yaml
---
series: "my-series"
seriesOrder: 1
---
```

## 下書き

公開したくない記事はフロントマターに`draft: true`を追加:

```yaml
---
title: "まだ公開しない記事"
draft: true
---
```

## SEOチェックリスト

記事を公開する前に確認:

- [ ] タイトルにキーワードを含む
- [ ] descriptionが150文字程度
- [ ] 適切なタグを設定
- [ ] 見出しの階層が正しい（H1→H2→H3）
- [ ] 内部リンクを含む
- [ ] 外部リンクを含む（参考リンク）
- [ ] 画像にalt属性がある

## 便利なフロントマター

```yaml
---
title: "タイトル"
date: "2025-01-01"
description: "説明"
tags: ["タグ1", "タグ2"]
author: "ADA Lab"
image: "/images/blog/cover.jpg"  # OGP画像
draft: true                       # 下書き
series: "series-name"             # シリーズ
seriesOrder: 1                    # シリーズ内順序
---
```

## トラブルシューティング

### 記事が表示されない

1. ファイル名が英数字・ハイフンのみか確認
2. `draft: true`になっていないか確認
3. ファイル名が`_`で始まっていないか確認

### カテゴリーが表示されない

1. `_category.yaml`が存在するか確認
2. YAMLの構文エラーがないか確認

### ビルドエラー

```bash
npm run build
```

エラーメッセージを確認してください。
