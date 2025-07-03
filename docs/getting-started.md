# wumtodo 使い方ガイド

## はじめに

wumtodoは、Discordサーバーと連携してタスク管理ができるWebアプリケーションです。スラッシュコマンドを使用してタスクの作成・管理ができ、チームでの協働作業を効率化します。

## 現在の開発状況

### 完了した機能
- ✅ プロジェクト基盤の構築
- ✅ Astro + Cloudflare Workers環境の設定
- ✅ Tailwind CSS v4 + shadcn-uiの導入
- ✅ 基本的なUIコンポーネントの作成
- ✅ Discord認証システム（better-auth）
- ✅ データベース設計（D1 + Kysely）
- ✅ Discord Bot Webhookエンドポイント
- ✅ スラッシュコマンドの実装

### 開発中の機能
- 🚧 Web UIのタスク管理画面
- 🚧 リマインダー機能
- 🚧 スレッド自動作成機能

## ローカル開発環境のセットアップ

### 必要なツール
- Node.js 18以上
- pnpm
- Cloudflare アカウント

### セットアップ手順

1. リポジトリをクローン
```bash
git clone <repository-url>
cd wumtodo
```

2. 依存関係をインストール
```bash
pnpm install
```

3. 環境変数を設定
```bash
cp .env.example .dev.vars
# .dev.varsファイルを編集して必要な値を設定
```

4. Discord Botの設定
- [Discord Developer Portal](https://discord.com/developers/applications)でアプリケーションを作成
- 詳細は[Discord セットアップガイド](./discord-setup.md)を参照

5. 開発サーバーを起動
```bash
pnpm dev
```

6. ブラウザで http://localhost:4321 にアクセス

## 開発コマンド

```bash
# 開発サーバーの起動
pnpm dev

# ビルド
pnpm build

# プレビュー
pnpm preview

# リント
pnpm lint

# フォーマット
pnpm format

# 型チェック
pnpm typecheck

# Discord スラッシュコマンドを登録
pnpm discord:register
```

## プロジェクト構成

```
wumtodo/
├── src/
│   ├── components/     # Reactコンポーネント
│   │   └── ui/        # shadcn-uiコンポーネント
│   ├── layouts/       # Astroレイアウト
│   ├── pages/         # ページコンポーネント
│   ├── lib/           # ユーティリティ関数
│   └── styles/        # グローバルスタイル
├── public/            # 静的ファイル
├── docs/              # ドキュメント
└── wrangler.toml      # Cloudflare Workers設定
```

## 今後の実装予定

### フェーズ2: 認証システム
- Discord OAuth2認証
- better-authを使用したセッション管理
- ユーザー情報の保存

### フェーズ3: データベース設計
- Cloudflare D1を使用
- ユーザー、チーム、タスクのテーブル設計

### フェーズ4: Discord Bot開発
- スラッシュコマンドの実装
- タスク作成時の自動スレッド作成
- ステータス変更通知

### フェーズ5: Web UI実装
- タスク一覧ページ
- タスク詳細ページ
- チーム管理画面

### フェーズ6: リマインダー機能
- Cron Jobによる定期実行
- 期限通知のDiscord DM送信

## トラブルシューティング

### pnpm installでエラーが出る場合
```bash
pnpm store prune
pnpm install
```

### 開発サーバーが起動しない場合
- Node.jsのバージョンを確認（18以上が必要）
- ポート4321が使用されていないか確認

### その他の問題
GitHubのIssuesページで報告してください。