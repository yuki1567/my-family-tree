# 家系図管理アプリ

家族の系図を管理するWebアプリケーションです。

## 技術スタック

- **フロントエンド**: Nuxt.js 3 + TypeScript + 素のCSS
- **バックエンド**: Hono + Drizzle ORM + PostgreSQL
- **コンテナ**: Docker + Docker Compose
- **開発環境**: モノレポ構成

## セットアップ手順

### 1. 前提条件

- Docker & Docker Compose がインストール済みであること
- Node.js 18以上がインストール済みであること（開発用）

### 2. 環境構築

```bash
# リポジトリをクローン
git clone <repository-url>
cd family-tree-app

# 環境変数ファイルの確認
cp .env.example .env

# Docker環境の起動
docker-compose up -d

# 依存関係のインストール（コンテナ内）
docker-compose exec app npm install

# Drizzle ORMのセットアップ
docker-compose exec apps npm run db:migrate
docker-compose exec apps npm run db:seed
```

### 3. アプリケーション起動

```bash
# 開発サーバー起動
docker-compose exec app npm run dev
```

### 4. アクセス

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:4000
- **ヘルスチェック**: http://localhost:4000/health

## 開発コマンド

```bash
# ログ確認
docker-compose logs -f

# データベースの状態確認（Drizzle Studio）
docker-compose exec apps npm run db:studio

# テスト実行
docker-compose exec app npm run test

# リント実行
docker-compose exec app npm run lint

# 型チェック
docker-compose exec app npm run type-check
```

## プロジェクト構造

```
family-tree-app/
├── apps/
│   ├── frontend/          # Nuxt.js アプリケーション
│   └── backend/           # Express.js API
├── shared/                # 共通型定義・定数
├── docker/                # Docker設定ファイル
├── docs/                  # ドキュメント
└── docker-compose.yml     # Docker構成
```

## 主な機能

- 🏠 **ホーム**: アプリケーションの概要とクイックアクセス
- 👥 **人物管理**: 家族メンバーの追加・編集・検索
- 🌳 **家系図表示**: SVGによる視覚的な家族関係の表示
- ⚙️ **設定**: データのエクスポート・インポートなど

## API エンドポイント

### 人物管理

- `GET /api/people` - 全人物取得
- `GET /api/people/:id` - 特定人物取得
- `POST /api/people` - 人物作成
- `PUT /api/people/:id` - 人物更新
- `DELETE /api/people/:id` - 人物削除
- `GET /api/people/search` - 人物検索

### 関係性管理

- `GET /api/relationships` - 全関係性取得
- `POST /api/relationships` - 関係性作成
- `DELETE /api/relationships/:id` - 関係性削除

## 開発ルール

- TypeScript strict mode 必須
- Tailwind CSS・UIフレームワーク使用禁止
- 全ての開発作業はDockerコンテナ内で実行
- レスポンシブ対応はモバイルファースト

## トラブルシューティング

### ポート競合の場合

```bash
# ポート使用状況確認
lsof -i :3000
lsof -i :4000
lsof -i :3306

# Docker環境の再起動
docker-compose down
docker-compose up -d
```

### データベースリセット

```bash
# データベースボリュームを削除して再作成
docker-compose down -v
docker-compose up -d
docker-compose exec apps npm run db:migrate
docker-compose exec apps npm run db:seed
```
