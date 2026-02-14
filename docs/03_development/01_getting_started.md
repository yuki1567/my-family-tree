# 開発環境構築

## 1. 前提条件

### 1.1 重要な制約

- **Docker 必須**: ローカル Node.js 環境での実行は禁止
- **コンテナ内開発**: 全ての開発作業は Docker コンテナ内で実行
- **ポート使用**: 3000（フロントエンド）、4000（API）、5432（PostgreSQL）

## 2. プロジェクトセットアップ

### 2.1 プロジェクトクローン

```bash
# リポジトリクローン
git clone <repository-url> family-tree-app
cd family-tree-app

# ブランチ確認
git branch -a
git checkout develop  # 開発ブランチに切り替え
```

### 2.2 Docker 環境起動

```bash
# Docker Compose で全サービス起動
docker compose up -d

# 起動確認
docker compose ps

# ログ確認
docker compose logs -f
```

### 2.3 データベース初期化

```bash
# アプリケーションコンテナに入る
docker compose exec apps bash

# Drizzleマイグレーション生成
npm run db:generate

# マイグレーション実行（本番環境では慎重に）
npm run db:migrate

# または開発環境では直接スキーマを反映
npm run db:push

# 動作確認用データベース確認
npm run db:studio
# ブラウザで https://local.drizzle.studio にアクセス
```

## 3. 開発環境の起動・操作

### 3.1 基本操作

```bash
# アプリケーションコンテナに入る
docker compose exec apps bash

# 依存関係インストール
npm install

# 型チェック
npm run type-check
```

### 3.2 開発サーバー起動

```bash
# PM2による自動起動（entrypoint.shで実行）
# 手動起動の場合
docker compose exec apps npm run dev

# または新しいターミナルで
docker compose exec apps bash
npm run dev
```

### 3.3 アプリケーションアクセス

- **フロントエンド**: http://localhost:3000
- **API エンドポイント**: http://localhost:4000
- **Drizzle Studio**: https://local.drizzle.studio（`npm run db:studio`実行時）

### 3.4 基本的な開発コマンド

```bash
# アプリケーションコンテナに入る
docker compose exec apps bash

# ビルド
npm run build

# 型チェック
npm run type-check

# コード品質チェック（リント + フォーマット + import整理）
npm run check

# コード品質自動修正
npm run check:fix

# テスト実行
npm run test
```

## 4. データベース操作

### 4.1 Drizzle Kit 操作

```bash
# マイグレーション生成（スキーマから自動生成）
npm run db:generate

# マイグレーション実行
npm run db:migrate

# スキーマを直接DBに反映（開発環境のみ）
npm run db:push

# Drizzle Studio起動（データ閲覧・編集）
npm run db:studio

# データベース接続確認
docker compose exec apps npm run db:push --help
```

## 5. トラブルシューティング

### 5.1 よくある問題と解決方法

#### Docker 関連

**問題**: `docker compose up` でエラーが発生

```bash
# コンテナ・ボリューム・ネットワークをクリア
docker compose down -v --remove-orphans
docker system prune -f

# イメージを再ビルド
docker compose build --no-cache

# 再起動
docker compose up -d
```

**問題**: ポート競合エラー

```bash
# 使用中のポートを確認
lsof -i :3000
lsof -i :4000
lsof -i :5432

# プロセス停止または.envでPOSTGRES_PORT変更
```

#### データベース関連

**問題**: データベース接続エラー

```bash
# データベースコンテナ状態確認
docker compose logs db

# データベース再起動
docker compose restart db

# 接続テスト
docker compose exec apps npm run db:push
```

**問題**: マイグレーションエラー

```bash
# マイグレーション生成の確認
npm run db:generate

# スキーマを直接DBに反映（開発環境のみ）
npm run db:push

# マイグレーション実行
npm run db:migrate

# データベース再起動が必要な場合
docker compose down -v
docker compose up -d
```

#### アプリケーション関連

**問題**: npm install エラー

```bash
# node_modulesクリア
docker compose exec apps rm -rf node_modules
docker compose exec apps npm cache clean --force
docker compose exec apps npm install
```

**問題**: TypeScript エラー

```bash
# Drizzleスキーマの型チェック
docker compose exec apps npm run type-check

# TypeScript設定確認
docker compose exec apps npx tsc --noEmit
```

#### PM2関連

**問題**: PM2起動エラー「No script path - aborting」

```bash
# PM2プロセス状態確認
docker compose exec apps pm2 list

# 手動でPM2起動テスト
docker compose exec apps pm2 start ecosystem.config.cjs

# 作業ディレクトリ確認
docker compose exec apps pwd
docker compose exec apps ls -la
```

**問題**: ES Modules vs CommonJS エラー

```bash
# ecosystem.config.jsの拡張子確認
ls -la ecosystem.config.*

# .cjs拡張子に変更済みか確認
# ファイルが.jsの場合は.cjsに変更が必要
```

**修正例**:

- `ecosystem.config.js` → `ecosystem.config.cjs`
- `export default` → `module.exports`
- Dockerfileでのファイルコピーパス更新

### 5.3 ログ確認方法

```bash
# 全サービスのログ
docker compose logs -f

# 特定サービスのログ
docker compose logs -f apps
docker compose logs -f db

# PM2ログ確認
docker compose exec apps pm2 logs

# アプリケーション内のログファイル確認
docker compose exec apps tail -f logs/frontend-combined.log
docker compose exec apps tail -f logs/backend-combined.log
```
