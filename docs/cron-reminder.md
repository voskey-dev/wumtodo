# Cronリマインダー機能

wumtodoのcronリマインダー機能は、期限が近いタスクについて自動的にDiscordで通知を送信します。

## 機能概要

毎日午前9時（UTC）に以下のタスクをチェックして通知を送信します：

- 期限切れのタスク（🚨）
- 今日が期限のタスク（⚠️）
- 明日が期限のタスク（📅）

通知は以下の場所に送信されます：

1. タスクのDiscordスレッド（存在する場合）
2. タスクが作成されたチャンネル（スレッドがない場合）
3. 担当者へのDM
4. タスク作成者へのDM（担当者と異なる場合）

## デプロイ方法

### 1. 初回デプロイ

```bash
# cronワーカーをデプロイ
pnpm run deploy:cron
```

### 2. ローカル開発

```bash
# cronワーカーをローカルで実行
pnpm run dev:cron
```

### 3. 手動テスト

開発環境でcronジョブを手動でトリガーする場合：

```bash
# Wranglerでcronジョブを手動実行
wrangler job trigger wumtodo-cron --config wrangler.cron.toml
```

## 設定

### cron実行時間の変更

`wrangler.cron.toml`の`crons`設定を編集します：

```toml
[triggers]
crons = ["0 9 * * *"]  # 毎日午前9時（UTC）
```

Cron式の形式：
- 分（0-59）
- 時（0-23）
- 日（1-31）
- 月（1-12）
- 曜日（0-7、0と7は日曜日）

例：
- `"0 9 * * *"` - 毎日午前9時（UTC）
- `"0 9,18 * * *"` - 毎日午前9時と午後6時
- `"0 9 * * 1-5"` - 平日の午前9時

### 環境変数

cronワーカーに必要な環境変数：

- `DISCORD_BOT_TOKEN`: Discord Botのトークン
- `DB`: D1データベースのバインディング（自動設定）

## トラブルシューティング

### cronジョブが実行されない

1. ワーカーが正しくデプロイされているか確認：
   ```bash
   wrangler tail wumtodo-cron
   ```

2. cron式が正しいか確認

3. Discord Botのトークンが有効か確認

### 通知が送信されない

1. Discord Botに必要な権限があるか確認：
   - メッセージ送信権限
   - DM送信権限
   - スレッド作成権限

2. タスクに正しい期限が設定されているか確認

3. タスクのステータスが「completed」でないことを確認

## ログの確認

```bash
# リアルタイムログを表示
wrangler tail wumtodo-cron --format pretty

# エラーログのみ表示
wrangler tail wumtodo-cron --format pretty --status error
```