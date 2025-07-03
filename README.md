# wumtodo

Discordと連携するチーム向けタスク管理アプリケーション

## 🌟 特徴

- **Discord統合**: スラッシュコマンドでタスク管理
- **自動スレッド作成**: タスクごとにDiscordスレッドを自動生成
- **リアルタイム通知**: ステータス変更、担当者変更、コメントなどを即座に通知
- **メンション機能**: @メンションでユーザーに直接通知
- **期限リマインダー**: 自動的に期限が近いタスクをリマインド
- **Web UI**: 直感的なWebインターフェースでの管理も可能

## 🛠 技術スタック

- **フレームワーク**: Astro
- **ランタイム**: Cloudflare Workers
- **データベース**: Cloudflare D1
- **認証**: better-auth (Discord OAuth)
- **UI**: Svelte + Tailwind CSS + shadcn-ui
- **パッケージマネージャー**: pnpm

## 🚀 クイックスタート

### 1. リポジトリをクローン
```bash
git clone https://github.com/yourusername/wumtodo.git
cd wumtodo
```

### 2. 依存関係をインストール
```bash
pnpm install
```

### 3. Discord アプリケーションの設定
[Discord Developer Portal](https://discord.com/developers/applications)でアプリケーションを作成し、以下の情報を取得：
- Client ID
- Client Secret
- Bot Token
- Public Key
- Application ID

詳細は[Discord セットアップガイド](docs/discord-setup.md)を参照。

### 4. 環境変数を設定
```bash
# ローカル開発用
cp .env.local.example .env.local
# .env.localを編集してDiscordの情報を設定
```

### 5. データベースを初期化
```bash
# D1データベースを作成
npx wrangler d1 create wumtodo

# マイグレーションを実行
pnpm db:migrate
```

### 6. 開発サーバーを起動
```bash
pnpm dev
```

### 7. Discord Webhookの設定（スラッシュコマンド用）
```bash
# ngrokを使ってローカルを公開
ngrok http 4321

# Discord Developer PortalでInteractions Endpoint URLを設定
# https://xxxx.ngrok.io/api/discord/interactions
```

### 8. Discordコマンドを登録
```bash
pnpm discord:register
```

## 📚 ドキュメント

- [使い方ガイド](docs/usage.md) - 基本的な使い方とコマンド一覧
- [Discord Bot セットアップ](docs/discord-bot-setup.md) - Botの追加と初期設定
- [開発者ガイド](docs/development.md) - 開発環境の詳細設定
- [トラブルシューティング](docs/troubleshooting-401.md) - 401エラーの対処法

## 🔧 利用可能なコマンド

| コマンド | 説明 |
|---------|------|
| `pnpm dev` | 開発サーバーを起動 (http://localhost:4321) |
| `pnpm build` | プロダクションビルドを作成 |
| `pnpm preview` | ビルドをプレビュー |
| `pnpm typecheck` | TypeScriptの型チェック |
| `pnpm db:create` | D1データベースを作成 |
| `pnpm db:migrate` | データベースマイグレーションを実行 |
| `pnpm discord:register` | Discordスラッシュコマンドを登録 |
| `pnpm deploy` | Cloudflare Workersにデプロイ |

## 🐛 トラブルシューティング

### 401エラーが発生する場合
1. `DISCORD_PUBLIC_KEY`が正しく設定されているか確認
2. `.env.local`ファイルが存在し、正しく読み込まれているか確認
3. [詳細なトラブルシューティングガイド](docs/troubleshooting-401.md)を参照

### スラッシュコマンドが表示されない
1. `pnpm discord:register`を実行したか確認
2. Botに必要な権限があるか確認
3. Discordクライアントを再起動

### チームが表示されない
1. サーバー管理者が `/wumtodo setup` を実行
2. または任意のタスクコマンドを実行してチームを初期化

## 🤝 コントリビューション

プルリクエストを歓迎します！大きな変更を行う場合は、まずissueを作成して変更内容について議論してください。

## 📄 ライセンス

[MIT](LICENSE)

## 🙏 謝辞

- [Astro](https://astro.build/)
- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Discord.js](https://discord.js.org/)
- [shadcn-ui](https://ui.shadcn.com/)