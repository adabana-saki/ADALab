# Claude Code 設定

## コミットメッセージ規則

### フォーマット
```
<type>: <emoji> #<issue_number> <description>
```

### タイプ
- `feat` - 新機能
- `fix` - バグ修正
- `docs` - ドキュメント
- `style` - フォーマット（コードの動作に影響しない）
- `refactor` - リファクタリング
- `perf` - パフォーマンス改善
- `test` - テスト
- `chore` - ビルド、CI、その他

### 絵文字
- ⚡ `:zap:` - パフォーマンス改善
- ✨ `:sparkles:` - 新機能
- 🐛 `:bug:` - バグ修正
- 📝 `:memo:` - ドキュメント
- 🎨 `:art:` - コード構造/フォーマット
- 🔧 `:wrench:` - 設定ファイル
- 🚀 `:rocket:` - デプロイ
- ♻️ `:recycle:` - リファクタリング
- 🔒 `:lock:` - セキュリティ

### 例
```
feat: ✨ #15 ユーザー認証機能を追加
fix: 🐛 #23 ログインエラーを修正
docs: 📝 #30 READMEを更新
chore: 🔧 CI設定を更新
```

### ルール
- Issue番号がない場合は省略可
- 日本語または英語で記述
- 50文字以内で簡潔に

## ブランチ戦略

### 構造
```
main (本番)
  └── feature/* (新機能)
  └── fix/* (バグ修正)
```

### ワークフロー
1. `feature/機能名` または `fix/修正内容` ブランチを作成
2. 作業・コミット
3. PRを作成 → main にマージ
4. Cloudflareが自動デプロイ

## プロジェクト情報

- **デプロイ先**: Cloudflare Pages (Git連携)
- **URL**: https://adalabtech.com
- **フレームワーク**: Next.js 15.1 + React 19
- **言語**: TypeScript
