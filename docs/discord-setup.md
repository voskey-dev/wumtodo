# Discord Bot セットアップガイド

## 概要

wumtodoはDiscordのスラッシュコマンドを使用してタスク管理を行います。このガイドでは、Discord Botの設定方法を説明します。

## Discord Applicationの作成

1. [Discord Developer Portal](https://discord.com/developers/applications)にアクセス
2. 「New Application」をクリック
3. アプリケーション名を入力（例：wumtodo）

## Bot設定

1. 左メニューから「Bot」を選択
2. 「Reset Token」をクリックしてトークンを生成
3. トークンをコピーして`.dev.vars`の`DISCORD_BOT_TOKEN`に設定

## OAuth2設定

1. 左メニューから「OAuth2」→「General」を選択
2. Client IDをコピーして`.dev.vars`の`DISCORD_CLIENT_ID`に設定
3. Client Secretをコピーして`.dev.vars`の`DISCORD_CLIENT_SECRET`に設定
4. Redirectsに以下を追加：
   - `http://localhost:4321/api/auth/callback/discord`（開発用）
   - `https://your-domain.com/api/auth/callback/discord`（本番用）

## Interactions Endpoint URLの設定

1. 左メニューから「General Information」を選択
2. 「Public Key」をコピーして`.dev.vars`の`DISCORD_PUBLIC_KEY`に設定
3. 「Application ID」をコピーして`.dev.vars`の`DISCORD_APPLICATION_ID`に設定
4. 「Interactions Endpoint URL」に以下を設定：
   - 開発用：ngrokなどでローカルを公開して設定
   - 本番用：`https://your-domain.com/api/discord/interactions`

## Botの招待

1. 左メニューから「OAuth2」→「URL Generator」を選択
2. Scopesで以下を選択：
   - `bot`
   - `applications.commands`
3. Bot Permissionsで以下を選択：
   - Send Messages
   - Create Public Threads
   - Send Messages in Threads
   - Manage Messages
   - Manage Threads
   - Read Message History
   - Use Slash Commands
4. 生成されたURLをコピーしてブラウザで開く
5. Botを追加したいサーバーを選択

## スラッシュコマンドの登録

```bash
# 環境変数を設定した後
pnpm discord:register
```

## 利用可能なコマンド

### /task create
新しいタスクを作成します。
- `title` (必須): タスクのタイトル
- `description`: タスクの詳細説明
- `assignee`: 担当者
- `priority`: 優先度（高/中/低）

### /task list
タスク一覧を表示します。
- `status`: ステータスでフィルター（未着手/進行中/完了）
- `assignee`: 担当者でフィルター

### /task status
タスクのステータスを変更します。
- `task_id` (必須): タスクID
- `status` (必須): 新しいステータス

### /task assign
タスクの担当者を変更します。
- `task_id` (必須): タスクID
- `user` (必須): 新しい担当者

### /task due
タスクの期限を設定します。
- `task_id` (必須): タスクID
- `date` (必須): 期限（YYYY-MM-DD形式）

### /task close
タスクを完了にします。
- `task_id` (必須): タスクID

## トラブルシューティング

### Interaction Endpoint URLが検証されない
- Public Keyが正しく設定されているか確認
- エンドポイントが公開されているか確認（ngrok等）
- 署名検証のコードが正しく実装されているか確認

### コマンドが表示されない
- `pnpm discord:register`を実行したか確認
- Botが正しい権限でサーバーに追加されているか確認
- コマンドの登録に数分かかる場合があります