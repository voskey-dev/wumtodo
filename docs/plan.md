# wumtodo 実装計画

## プロジェクト概要
**wumtodo**は、Discordサーバーと連携するチーム向けタスク管理Webアプリケーションです。

### 主要機能
- Discord認証によるログイン
- スラッシュコマンドによるタスク操作
- タスクごとのDiscordスレッド作成
- 期限リマインダー機能
- チーム・ユーザー単位でのタスク管理

## 技術スタック
- **フレームワーク**: Astro
- **デプロイ**: Cloudflare Workers
- **データベース**: Cloudflare D1
- **認証**: better-auth
- **CSS**: Tailwind CSS v4
- **UI**: shadcn-ui
- **パッケージマネージャー**: pnpm

## フェーズ別実装計画

### フェーズ1: 基盤構築（1-2週間）

#### 1.1 プロジェクト初期設定
- [x] Astroプロジェクトの初期化
- [x] Cloudflare Workers統合の設定
- [x] pnpmワークスペース設定
- [x] TypeScript設定
- [x] ESLint/Prettier設定
- [x] Git設定と初回コミット

#### 1.2 開発環境構築
- [x] Cloudflare D1データベースの作成
- [x] 環境変数の設定（.env.local）
- [x] Wranglerの設定
- [x] 開発用スクリプトの準備

#### 1.3 基本的なUI構築
- [x] Tailwind CSS v4の設定
- [x] shadcn-uiの導入と設定
- [x] レイアウトコンポーネントの作成
- [x] 基本的なページ構造の実装

### フェーズ2: 認証システム（1週間）

#### 2.1 better-auth設定
- [x] better-authの初期設定
- [x] D1アダプターの設定
- [x] セッション管理の実装

#### 2.2 Discord OAuth実装
- [x] Discord OAuth2プロバイダーの設定
- [x] ログイン/ログアウトフローの実装
- [x] ユーザー情報の取得と保存
- [x] Discord ID自動保存hookの実装

#### 2.3 認証ミドルウェア
- [x] 保護されたルートの実装
- [x] 認証状態の管理
- [x] リダイレクト処理

### フェーズ3: データベース設計（3-4日）

#### 3.1 スキーマ設計
```sql
-- ユーザーテーブル
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  discord_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- チームテーブル
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  discord_server_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- チームメンバーテーブル
CREATE TABLE team_members (
  team_id TEXT REFERENCES teams(id),
  user_id TEXT REFERENCES users(id),
  role TEXT DEFAULT 'member',
  PRIMARY KEY (team_id, user_id)
);

-- タスクテーブル
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  team_id TEXT REFERENCES teams(id),
  assignee_id TEXT REFERENCES users(id),
  creator_id TEXT REFERENCES users(id),
  discord_thread_id TEXT,
  discord_channel_id TEXT,
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- タスクコメントテーブル
CREATE TABLE task_comments (
  id TEXT PRIMARY KEY,
  task_id TEXT REFERENCES tasks(id),
  user_id TEXT REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.2 マイグレーション
- [x] D1マイグレーションファイルの作成
- [x] インデックスの設定
- [x] 初期データの投入

### フェーズ4: Discord Bot開発（1-2週間）

#### 4.1 Discord Bot基本設定
- [x] Discord Botの作成と設定
- [x] Bot権限の設定
- [x] Webhookエンドポイントの実装

#### 4.2 スラッシュコマンド実装
- [x] `/task create` - タスク作成
- [x] `/task list` - タスク一覧表示
- [x] `/task assign` - タスク割り当て
- [x] `/task status` - ステータス変更
- [x] `/task due` - 期限設定
- [x] `/task close` - タスク完了

#### 4.3 Discord連携機能
- [x] タスク作成時のスレッド自動作成（Workers互換実装）
- [x] スレッドとタスクの紐付け
- [x] ステータス変更の通知
- [x] メンション機能
- [x] コメント機能（/task comment）
- [x] Discord署名検証の修正（Ed25519アルゴリズム名を小文字に変更）
- [x] タスクリゾルバー機能（スレッド内でのタスクID自動解決）

### フェーズ5: Web UI実装（2週間）

#### 5.1 ダッシュボード
- [x] タスク一覧ページ
- [x] フィルタリング機能（ステータス、担当者、期限）
- [x] ソート機能
- [x] ページネーション

#### 5.2 タスク詳細ページ
- [x] タスク情報の表示
- [x] インライン編集機能
- [x] コメント機能
- [x] Discord スレッドへのリンク

#### 5.3 タスク管理機能
- [x] タスク名での検索機能を実装
- [x] Web UIからの新規タスク作成機能を削除（Discord専用に統一）

#### 5.4 チーム管理
- [x] チームメンバー一覧
- [x] メンバー招待機能（Discordサーバー経由）
- [x] 権限管理

#### 5.5 ユーザープロファイル
- [x] プロファイル表示
- [x] 担当タスク一覧
- [x] 通知設定

### フェーズ6: リマインダー機能（3-4日）

#### 6.1 Cron Job設定
- [x] Cloudflare Workers Cron Triggersの設定
- [x] 定期実行スケジュールの設定

#### 6.2 リマインダーロジック
- [x] 期限チェック処理
- [x] 通知対象の抽出
- [x] Discord DM送信機能
- [x] チャンネル通知機能

### フェーズ7: 最終調整とデプロイ（1週間）

#### 7.1 テスト
- [ ] 単体テストの作成
- [ ] 統合テストの実装
- [ ] E2Eテストの設定

#### 7.2 パフォーマンス最適化
- [ ] データベースクエリの最適化
- [ ] キャッシュ戦略の実装
- [ ] バンドルサイズの最適化

#### 7.3 セキュリティ
- [ ] 入力値検証
- [ ] XSS対策
- [ ] CSRF対策
- [ ] レート制限

#### 7.4 ドキュメント作成
- [ ] 使い方ガイド（日本語）
- [ ] API仕様書
- [ ] デプロイ手順書
- [ ] 運用マニュアル

#### 7.5 バグ修正と機能改善
- [x] tasksページのフィルターUIが機能しない問題を修正（bits-ui v2 API対応）
- [x] Selectコンポーネントを新しいAPIに移行
- [x] UserAvatarコンポーネントを作成し、ユーザー表示を統一
- [x] tasksページのタスクカード全体をクリック可能に改善

#### 7.6 本番デプロイ
- [ ] Cloudflare Workers へのデプロイ
- [ ] カスタムドメインの設定
- [ ] SSL証明書の設定
- [ ] 監視設定

## 追加検討事項

### 将来的な拡張機能
- タスクのラベル機能
- カンバンボード表示
- ガントチャート
- レポート機能
- Webhook連携
- 他のサービス連携（GitHub、Slack等）

### 技術的な検討事項
- リアルタイム更新（WebSocket）
- オフライン対応（PWA）
- 多言語対応
- ダークモード

## 開発規約

### コーディング規約
- TypeScriptの厳密な型定義
- コンポーネントの責務分離
- 再利用可能なコンポーネント設計
- エラーハンドリングの統一

### Git運用
- feature/〇〇 ブランチでの開発
- タスク完了ごとのコミット
- わかりやすいコミットメッセージ
- PRベースのレビュー

### テスト方針
- 重要なビジネスロジックの単体テスト必須
- APIエンドポイントの統合テスト
- 主要なユーザーフローのE2Eテスト

## 見積もり工数
- 総開発期間: 約6-8週間
- 必要人員: 1-2名
- MVP完成目標: 4週間

## リスクと対策
1. **Discord API の制限**
   - 対策: レート制限の実装、エラーハンドリング

2. **D1 データベースの制限**
   - 対策: 適切なインデックス設計、クエリ最適化

3. **認証セキュリティ**
   - 対策: better-authのベストプラクティス遵守

4. **スケーラビリティ**
   - 対策: Cloudflare Workersの自動スケーリング活用