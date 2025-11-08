# Docker 環境構築

## 1. Docker 構成概要

### 1.1 コンテナ構成

```
family-tree-app/
├── apps (Node.js + PM2) # PM2管理による統合アプリケーション
│   ├── frontend         # Nuxt.js (PM2プロセス)
│   └── backend          # Express.js (PM2プロセス)
└── db (MySQL 8.4.6)     # データベース
```

### 1.2 ネットワーク・ポート構成

- **apps**: 3000（Nuxt.js）, 4000（Express.js API）- PM2による単一コンテナ管理
- **db**: ${MYSQL_PORT}（MySQL、環境変数で設定可能）

### 1.3 PM2統合運用の利点

- **プロセス管理**: フロントエンド・バックエンドの統合監視
- **自動復旧**: プロセス異常時の迅速な検出
- **ログ統合**: 両サービスのログを一元管理
- **開発効率**: 単一コンテナでの運用による管理簡素化

### 1.4 開発の制約

- **Docker 必須**: ローカル Node.js 環境での実行禁止
- **コンテナ内開発**: 全ての開発作業は Docker コンテナ内で実行
- **ホットリロード**: ボリュームマウントによる開発効率化

## 2. Docker 設定ファイル

### 2.1 プロジェクト構造

```
family-tree-app/
├── docker-compose.yml          # メイン構成定義
├── .env                        # 環境変数
├── .dockerignore              # Docker除外ファイル
└── docker/                    # Docker関連ファイル
    ├── apps/
    │   ├── Dockerfile         # Node.js アプリ用
    │   └── entrypoint.sh      # 起動スクリプト
    └── db/
        ├── Dockerfile         # MySQL用（カスタマイズ用）
        └── my.cnf            # MySQL設定
```

### 2.2 Docker Compose 設定

**docker-compose.yml** の基本構成：

- **apps コンテナ**: PM2統合による Node.js アプリケーション実行環境
- **db コンテナ**: MySQL 8.4.6 データベース
- **環境変数**: .env ファイルによる統一管理
- **ボリューム**: 部分的ソースコードマウント（`./apps:/usr/src/apps`）
- **作業ディレクトリ**: `/usr/src`（コンテナ内でのプロジェクトルート）

#### 設計方針と理由

- **部分ボリュームマウント**: `./apps:/usr/src/apps`での限定的なファイル同期
  - _理由_: 必要な部分のみ同期することで、パフォーマンス向上とパス構造の明確化
  - _効果_: ホットリロード対応、コンテナ内でのパス一貫性確保
- **作業ディレクトリ統一**: `/usr/src`での一元管理
  - _理由_: package.json、npm workspace、PM2設定の統合管理
  - _効果_: npm scriptsとPM2の動作環境統一
- **開発環境特化**: データ永続化なし（本番はRDS使用）
  - _理由_: 開発環境では高速な環境リセットを重視、本番環境はAWS RDSによる管理運用のため
- **ポート競合回避**: MYSQL_PORT環境変数でカスタマイズ可能
  - _理由_: 開発者のローカル環境で他のMySQLサービスとの競合を避けるため

### 2.3 開発環境の特徴

- **ホットリロード**: ソースコード変更の自動反映
- **ボリュームマウント**: ローカルファイルとコンテナ内の同期
- **ヘルスチェック**: サービス起動状態の監視
- **依存関係管理**: データベース起動完了後にアプリ起動

## 3. ファイル構成要素

### 3.1 アプリケーション用 Dockerfile

**docker/apps/Dockerfile** の設計方針と構成：

#### 基本構成

- **ベースイメージ**: Node.js 22.18-slim（Debian）
  - _選定理由_: Node.js LTS最新版、軽量性と安全性のバランス、開発・本番での一貫性確保
- **モノレポ対応**: ワークスペース構成での依存関係管理
  - _選定理由_: フロントエンド・バックエンド・共有コードの一元管理による開発効率向上
- **レイヤーキャッシュ最適化**: 変更頻度別のファイルコピー順序
  - _選定理由_: 開発時のビルド時間短縮（依存関係変更なしの場合、数秒でビルド完了）

#### 開発環境特化設計

- **作業ディレクトリ**: `/usr/src`での統一管理
  - _選定理由_: npm workspace、PM2設定、ファイル構造の一元化
  - _効果_: パス参照の簡素化、設定ファイル間の整合性確保
- **開発ツール統合**: vim、curl、default-mysql-clientの標準インストール
  - _選定理由_: コンテナ内での直接ファイル編集、DB接続確認による開発効率向上
- **PM2統合管理**: ecosystem.config.cjs による統合プロセス管理
  - _選定理由_: CommonJS形式でのES Modules互換性確保、フロント・バックエンド統合運用
- **部分ボリュームマウント対応**: `/usr/src/apps`での限定同期
  - _選定理由_: 必要最小限のファイル同期によるパフォーマンス最適化

### 3.2 モノレポ対応の最適化

#### ワークスペース構成

```
family-tree-app/
├── package.json          # ワークスペース管理
├── node_modules/          # 全依存関係（一元管理）
├── tsconfig.json         # 共通TypeScript設定
├── apps/
│   ├── frontend/
│   │   ├── package.json  # フロントエンド依存関係定義
│   │   └── tsconfig.json # フロントエンド設定
│   └── backend/
│       ├── package.json  # バックエンド依存関係定義
│       └── tsconfig.json # バックエンド設定
└── shared/types/         # 共通型定義
```

**node_modules 一元管理の理由:**

- **重複排除**: 共通依存関係の重複インストール回避
- **管理効率化**: 単一箇所での依存関係管理
- **ディスク容量節約**: ワークスペース機能による最適化
- **Dockerビルド最適化**: レイヤーキャッシュ効率の向上

#### ビルド最適化戦略

- **段階的ファイルコピー**: 変更頻度に応じた最適順序
  - _理由_: Dockerレイヤーキャッシュを最大活用し、開発時の再ビルド時間を最小化
- **依存関係一元管理**: ルートnode_modulesでの統合管理
  - _理由_: ワークスペース機能による重複排除と管理効率化
- **TypeScript設定継承**: 階層的設定ファイル管理
  - _理由_: 共通設定の一元化と、個別アプリの柔軟性確保

### 3.3 PM2統合プロセス管理

#### 設計方針

- **PM2による統合管理**: 単一コンテナ内での複数プロセス運用
  - _選定理由_: プロセス監視機能による安定性向上、統合ログ管理
- **ポート分離**: 3000（フロント）、4000（バック）
  - _選定理由_: 明確な責任分離と、同時開発時の競合回避
- **自動起動制御**: entrypoint.shによる起動シーケンス管理
  - _選定理由_: データベース準備確認後のアプリケーション起動で安全性確保

### 3.4 起動スクリプト（PM2統合運用）

**docker/apps/entrypoint.sh** の役割：

- データベース接続待機（PostgreSQL pg_isready）
- Drizzle ORMマイグレーション実行
- PM2による統合アプリケーション起動
- プロセス状態の継続監視

### 3.5 PostgreSQL コンテナ設定

**docker-compose.yml の db サービス** の設計方針：

- **ベースイメージ**: postgres:18-alpine
  - _選定理由_: 最新の安定版による機能・セキュリティ向上、軽量なAlpineベース
- **文字エンコーディング**: UTF-8（デフォルト）
  - _選定理由_: 日本語対応と絵文字サポート、PostgreSQLの標準設定
- **初期化スクリプト**: docker/db/init.sh
  - _選定理由_: アプリケーション用ユーザー（family_tree_user）の自動作成と権限設定

### 3.6 PostgreSQL 初期化スクリプト

**docker/db/init.sh** の設計方針：

#### アプリケーション用ユーザーの作成

- **基本方針**: 最小権限の原則に基づくユーザー分離
  - _選定理由_: セキュリティ向上、管理者権限と実行権限の分離
- **権限設定**: SELECT, INSERT, UPDATE, DELETE のみ付与
  - _選定理由_: アプリケーションに必要な最小限の権限のみ付与

#### 初期化スクリプトの内容

- **ユーザー作成**: ロールの作成
  - _実装理由_: アプリケーション専用のデータベースユーザー
- **権限付与**: public スキーマへのアクセス権限
  - _実装理由_: テーブル操作に必要な最小権限の付与
- **デフォルト権限**: 将来作成されるテーブルへの権限も自動付与
  - _実装理由_: マイグレーション時の権限設定の簡略化

#### PostgreSQL のデフォルト設定

- **文字エンコーディング**: UTF-8（PostgreSQLデフォルト）
  - _選定理由_: 多言語対応、日本語・絵文字完全サポート
- **その他設定**: PostgreSQL 18 デフォルト値を使用
  - _選定理由_: 公式推奨設定による安定性・パフォーマンス・セキュリティ確保

## 4. 環境変数設定

### 4.1 .env ファイル作成

プロジェクトルートに `.env` ファイルを作成し、必要な環境変数を設定してください。

**なぜ .env ファイルを使用するのか:**

- **セキュリティ**: 認証情報をコードから分離
- **環境別設定**: 開発・本番環境で異なる設定値を管理
- **チーム開発**: 各開発者が独自の設定を持てる
- **バージョン管理除外**: `.gitignore`により機密情報の誤コミットを防止

### 4.2 必要な環境変数

| 変数名                | 説明                  | 設定理由                                           |
| --------------------- | --------------------- | -------------------------------------------------- |
| `NODE_ENV`            | Node.js実行環境       | フレームワークの動作モード切り替えのため           |
| `DATABASE_URL`        | Prisma接続URL         | ORMライブラリによるDB接続設定のため                |
| `MYSQL_ROOT_PASSWORD` | MySQL root パスワード | 管理者権限による初期設定とセキュリティ確保のため   |
| `MYSQL_DATABASE`      | データベース名        | プロジェクト専用DB領域の作成のため                 |
| `MYSQL_USER`          | MySQL ユーザー名      | 最小権限の原則に基づくアプリ専用アカウントのため   |
| `MYSQL_PASSWORD`      | MySQL パスワード      | アプリケーションアカウントのセキュリティ確保のため |
| `MYSQL_PORT`          | MySQL外部ポート       | **他サービスとのポート競合回避のため**             |

### 4.3 セキュリティ注意事項

- **.env ファイルは Git にコミットしない**（.gitignore に追加済み）
- **強力なパスワードを設定**
- **本番環境では異なる認証情報を使用**

### 4.4 ポート競合の対処

他のMySQLサービスとの競合時は `.env` ファイルの `MYSQL_PORT` を変更してください。

**なぜ環境変数でポート設定するのか:**

- **開発者間の環境差異**: 各開発者のローカル環境で異なるポートが使用可能
- **CI/CD環境対応**: 自動化環境でのポート割り当ての柔軟性確保
- **保守性向上**: docker-compose.yml の直接編集を避け、設定ファイルでの管理
- **本番環境準備**: 将来的なロードバランサーやプロキシ設定への対応準備

## 5. 基本操作コマンド

### 5.1 環境起動・停止（PM2統合運用）

#### メインブランチでの起動

```bash
# 起動
aws-vault exec family-tree-dev -- docker-compose up -d
```

#### Worktree環境での起動

worktreeでは、issue番号ごとに独立したAWS profileとポート番号を使用します。

**前提条件:**

- メインブランチで`db`コンテナが起動していること（共有DBを使用）
- `start-issue`スクリプトでAWS profileが自動生成されていること

```bash
# Worktree用appsコンテナ起動
# AWS profile名: family-tree-worktree-{issueNumber}
# 例: issue #123の場合
aws-vault exec family-tree-worktree-123 -- docker compose up -d apps

# 起動確認
docker compose ps

# ポート確認
# Frontend: http://localhost:3123 (3000 + issue番号)
# API: http://localhost:4123 (4000 + issue番号)
```

#### ログ確認・操作

```bash
# 統合ログ確認
docker-compose logs -f apps

# データベースログ確認
docker-compose logs -f db

# PM2プロセス状態確認（コンテナ内）
docker-compose exec apps pm2 list

# 環境停止
docker-compose down

# 環境停止（ボリューム削除）
docker-compose down -v
```

**PM2統合運用の利点:**

- **統合管理**: 単一コンテナでのプロセス一元監視
- **自動復旧**: プロセス異常時の自動検出・ログ記録
- **開発効率**: 複雑なサービス間依存関係の自動管理

### 5.2 コンテナ操作

```bash
# アプリケーションコンテナに入る
docker-compose exec appsbash

# データベースコンテナに入る
docker-compose exec db bash

# MySQLに直接接続
docker-compose exec db mysql -u family_tree_user -p family_tree

# PM2プロセス管理（コンテナ内）
docker-compose exec apps pm2 list        # プロセス一覧
docker-compose exec appspm2 restart all # 全プロセス再起動
docker-compose exec appspm2 logs        # ログ確認
```

### 5.3 開発コマンド（PM2統合運用）

```bash
# PM2によるプロセス管理（自動起動）
# entrypoint.shにより自動実行されるため手動起動は不要

# ビルド（コンテナ内で実行）
docker-compose exec appsnpm run build:frontend              # フロントエンドビルド
docker-compose exec appsnpm run build:backend               # バックエンドビルド

# テスト実行
docker-compose exec appsnpm run test                        # 全体テスト

# Drizzle ORM操作（アプリケーションコンテナで実行）
docker-compose exec apps npm run db:studio                     # Drizzle Studio起動
docker-compose exec apps npm run db:generate                   # マイグレーションファイル生成
docker-compose exec apps npm run db:migrate                    # マイグレーション実行
docker-compose exec apps npm run db:seed                       # シードデータ投入

# ワークスペース全体操作
docker-compose exec appsnpm install                         # 依存関係更新時

# PM2プロセス制御
docker-compose exec appspm2 restart frontend               # フロントエンド再起動
docker-compose exec appspm2 restart backend                # バックエンド再起動
docker-compose exec appspm2 reload all                     # 全プロセス reload
```

**PM2統合開発のポイント:**

- **自動プロセス管理**: entrypoint.shによる起動時の自動プロセス開始
- **プロセス監視**: PM2による異常検出とログ記録
- **統合運用**: 単一コンテナでのフロント・バック統合管理

## 6. トラブルシューティング

### 6.1 よくある問題

#### ポート競合

```bash
# 使用中のポートを確認
lsof -i :3000
lsof -i :3306
lsof -i :4000

# プロセス停止
kill -9 <PID>

# Docker環境再起動
docker-compose down
docker-compose up -d
```

#### データベース接続エラー

```bash
# データベースコンテナ状態確認
docker-compose ps db
docker-compose logs db

# データベース再起動
docker-compose restart db

# ヘルスチェック確認
docker inspect family-tree-db | grep Health
```

#### ボリュームマウント問題

```bash
# ボリューム確認
docker volume ls
docker volume inspect family-tree-app_mysql_data

# ボリューム削除・再作成
docker-compose down -v
docker volume prune
docker-compose up -d
```

### 6.2 PM2関連のトラブルシューティング

#### PM2プロセス異常

```bash
# PM2プロセス状態確認
docker-compose exec apps pm2 list

# 異常プロセスの再起動
docker-compose exec appspm2 restart <プロセス名>

# 全プロセス再起動
docker-compose exec appspm2 restart all

# PM2ログ確認
docker-compose exec appspm2 logs --lines 100
```

#### entrypoint.sh実行エラー

```bash
# コンテナ起動ログ確認
docker-compose logs apps

# 手動でentrypoint.sh実行
docker-compose exec appsbash -c "./entrypoint.sh"

# データベース接続確認
docker-compose exec appsmysqladmin ping -h"db"
```

### 6.3 環境リセット

#### 完全リセット

```bash
# 全コンテナ・ボリューム・ネットワーク削除
docker-compose down -v --remove-orphans

# 不要なDockerリソース削除
docker system prune -f

# 環境再構築
docker-compose build --no-cache
docker-compose up -d
```

#### データベースリセット

```bash
# データベースボリュームのみ削除
docker-compose down
docker volume rm family-tree-app_mysql_data
docker-compose up -d
```

### 6.4 MySQL設定カスタマイズ（問題発生時）

#### パフォーマンス問題が発生した場合

**問題**: クエリが遅い、メモリ不足エラー
**対処**: my.cnfにパフォーマンス設定を追加

```ini
[mysqld]
# 既存設定
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci

# パフォーマンス設定（必要時のみ追加）
innodb_buffer_pool_size=512M
max_connections=200
```

#### デバッグが必要な場合

**問題**: SQLクエリの問題調査が必要
**対処**: ログ設定を有効化

```ini
[mysqld]
# 既存設定
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci

# デバッグ設定（問題調査時のみ追加）
slow_query_log=1
long_query_time=0.5
general_log=1
```

#### 設定変更後のコンテナ再起動

```bash
# 設定変更後は必ずコンテナ再起動
docker-compose restart db

# 設定確認
docker-compose exec db mysql -e "SHOW VARIABLES LIKE 'character_set%';"
```

**重要**:

- **問題解決後は設定を削除**（デフォルトに戻す）
- **設定追加の理由をコメントで記録**
- **本番環境では別途RDS設定で対応**
