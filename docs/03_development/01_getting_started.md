# 開発環境構築

## 1. 前提条件

### 1.1 重要な制約

- **Docker 必須**: ローカル Node.js 環境での実行は禁止
- **コンテナ内開発**: 全ての開発作業は Docker コンテナ内で実行
- **ポート使用**: 3000（フロントエンド）、4000（API）、3306（MySQL）

### 1.2 開発フェーズ

#### Phase 0: 環境構築（Infrastructure Setup）

- Docker環境の整備
- ワークスペース設定（package.json群）
- TypeScript設定（tsconfig.json群）
- 依存関係定義（各アプリのpackage.json）
- PM2統合設定

#### Phase 1: MVP（最小機能・ローカル版）

- 基本CRUD機能の実装
- LocalStorageでのデータ永続化
- SVG家系図の基本表示
- レスポンシブUI（モーダルベース）

#### Phase 2: 機能拡張・クラウド連携

- AWS S3との同期機能
- 検索機能（基本・詳細検索）
- JWT認証・ユーザー管理
- データエクスポート機能

#### Phase 3: 最適化・改善

- パフォーマンス最適化
- UX改善（アニメーション・操作性）
- セキュリティ強化
- 監視・ログ基盤整備

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
docker-compose up -d

# 起動確認
docker-compose ps

# ログ確認
docker-compose logs -f
```

### 2.3 データベース初期化

```bash
# アプリケーションコンテナに入る
docker-compose exec apps bash

# Prisma マイグレーション実行
npx prisma migrate dev --name init

# Prisma クライアント生成
npx prisma generate

# シードデータ投入（任意）
npm run db:seed

# 動作確認用データベース確認
npx prisma studio
# ブラウザで http://localhost:5555 にアクセス
```

## 3. 開発環境の起動・操作

### 3.1 基本操作

```bash
# アプリケーションコンテナに入る
docker-compose exec apps bash

# 依存関係インストール
npm install

# 型チェック
npm run type-check
```

### 3.2 開発サーバー起動

```bash
# PM2による自動起動（entrypoint.shで実行）
# 手動起動の場合
docker-compose exec apps npm run dev

# または新しいターミナルで
docker-compose exec apps bash
npm run dev
```

### 3.3 アプリケーションアクセス

- **フロントエンド**: http://localhost:3000
- **API エンドポイント**: http://localhost:4000
- **Prisma Studio**: http://localhost:5555

### 3.4 基本的な開発コマンド

```bash
# アプリケーションコンテナに入る
docker-compose exec apps bash

# ビルド
npm run build

# 型チェック
npm run type-check

# リント実行
npm run lint

# フォーマット実行
npm run format

# テスト実行
npm run test
```

## 4. データベース操作

### 4.1 Prisma 操作

```bash
# マイグレーション作成
npx prisma migrate dev --name <migration-name>

# マイグレーション状態確認
npx prisma migrate status

# データベースリセット
npx prisma migrate reset

# Prisma Studio起動
npx prisma studio

# データベーススキーマ確認
npx prisma db pull
```

### 4.2 シードデータ管理

```bash
# シードデータ投入
npm run db:seed

# シードデータ内容確認
cat apps/backend/prisma/seed.ts
```

## 5. トラブルシューティング

### 5.1 よくある問題と解決方法

#### Docker 関連

**問題**: `docker-compose up` でエラーが発生

```bash
# コンテナ・ボリューム・ネットワークをクリア
docker-compose down -v --remove-orphans
docker system prune -f

# イメージを再ビルド
docker-compose build --no-cache

# 再起動
docker-compose up -d
```

**問題**: ポート競合エラー

```bash
# 使用中のポートを確認
lsof -i :3000
lsof -i :4000
lsof -i :3306

# プロセス停止または.envでMYSQL_PORT変更
```

#### データベース関連

**問題**: データベース接続エラー

```bash
# データベースコンテナ状態確認
docker-compose logs db

# データベース再起動
docker-compose restart db

# 接続テスト
docker-compose exec apps npx prisma db pull
```

**問題**: マイグレーションエラー

```bash
# マイグレーション状態確認
npx prisma migrate status

# 強制リセット（開発環境のみ）
npx prisma migrate reset --force

# 手動マイグレーション
npx prisma db push
```

#### アプリケーション関連

**問題**: npm install エラー

```bash
# node_modulesクリア
docker-compose exec apps rm -rf node_modules
docker-compose exec apps npm cache clean --force
docker-compose exec apps npm install
```

**問題**: TypeScript エラー

```bash
# 型定義再生成
docker-compose exec apps npx prisma generate

# TypeScript設定確認
docker-compose exec apps npm run type-check
```

#### PM2関連

**問題**: PM2起動エラー「No script path - aborting」

```bash
# PM2プロセス状態確認
docker-compose exec apps pm2 list

# 手動でPM2起動テスト
docker-compose exec apps pm2 start ecosystem.config.cjs

# 作業ディレクトリ確認
docker-compose exec apps pwd
docker-compose exec apps ls -la
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
docker-compose logs -f

# 特定サービスのログ
docker-compose logs -f apps
docker-compose logs -f db

# PM2ログ確認
docker-compose exec apps pm2 logs

# アプリケーション内のログファイル確認
docker-compose exec apps tail -f logs/frontend-combined.log
docker-compose exec apps tail -f logs/backend-combined.log
```
