# システムアーキテクチャ設計書

## 1. アーキテクチャ概要

### 1.1 基本方針

**保守性を最優先とした設計**

本プロジェクトは長期的な保守・拡張を前提とし、以下の原則に基づいて設計されています：

- **責任の分離**: フロントエンド・バックエンド・共有コードの明確な分離
- **疎結合**: 各モジュール間の依存関係を最小限に抑制
- **一貫性**: 統一されたコーディング規約・設計パターンの採用
- **拡張性**: 新機能追加時の既存コードへの影響を最小化

### 1.2 モノレポ構成の選択理由

#### なぜモノレポを採用したか

1. **型安全性の共有**: フロント・バック間で TypeScript 型定義を統一
2. **保守効率の向上**: 関連する変更を単一リポジトリで一括管理
3. **開発環境の統一**: Docker 構成・ビルドプロセスの一元化
4. **依存関係の最適化**: 共通ライブラリの重複インストール回避

#### ワークスペース分離の利点

- 各アプリケーションの独立性確保
- ビルド・テスト・デプロイの個別実行
- 技術スタックの部分的変更が容易

## 2. プロジェクト構造概要

### 2.1 共有レイヤー（apps/shared/）

#### 設計思想

フロントエンド・バックエンド間の**型安全性**と**一貫性**を保証

```typescript
apps/shared/
├── types/
│   ├── request.ts              # API リクエスト型
│   └── response.ts             # API レスポンス型
└── constants/
    ├── api-routes.ts           # エンドポイント定義
    └── messages.ts             # エラーメッセージ統一
```

#### 保守性の担保

- 型変更時のフロント・バック同期更新
- API インターフェースの一元管理
- メッセージ・定数の重複排除

## 3. フロントエンド構成（apps/frontend/）

### 3.1 Nuxt 3 + Atomic Design

```typescript
frontend/
├── components/
│   ├── atoms/                  # 基本UIパーツ（Button, Input）
│   ├── molecules/              # 複合コンポーネント（SearchBox）
│   └── organisms/              # 複雑なUI（FamilyTreeSVG）
├── composables/                # ビジネスロジック抽象化
├── store/                      # Pinia状態管理
├── pages/                      # ルーティング（Auto Routing）
└── layouts/                    # 共通レイアウト
```

### 3.2 保守性の考慮点

#### Atomic Design の採用理由

- **再利用性**: 小さなコンポーネントの組み合わせ
- **テスト容易性**: 単一責任の原則に基づく分割
- **変更影響範囲の限定**: 階層構造による依存関係の明確化

## 4. バックエンド構成（apps/backend/）

### 4.1 レイヤードアーキテクチャ + Express

```typescript
backend/
├── controllers/               # HTTPレイヤー（薄い層）
├── services/                  # ビジネスロジック層
├── repositories/              # データアクセス層（抽象化）
├── routes/                    # ルーティング定義
├── middlewares/               # 横断的関心事
├── validations/               # バリデーションスキーマ
└── database/                  # データベース関連（ORM非依存）
    ├── schema.prisma         # スキーマ定義
    ├── migrations/           # マイグレーションファイル
    ├── seeds/                # 初期データ
    └── config/               # DB接続設定
```

### 4.2 レイヤー分離の理由

#### 保守性の観点

- **単一責任**: 各レイヤーが 1 つの責任のみを持つ
- **依存関係の制御**: 上位層から下位層への単方向依存
- **テスト容易性**: 各層の独立したテスト実装

#### 具体的な責任分担

```typescript
// Controller: HTTPリクエスト・レスポンス
export const createPerson = async (req: Request, res: Response) => {
  const data = validatePersonData(req.body)
  const result = await personService.create(data)
  res.json(result)
}

// Service: ビジネスロジック
export const create = async (data: CreatePersonData) => {
  return await personRepository.create(data)
}

// Repository: データアクセス
export const create = async (data: CreatePersonData) => {
  return await prisma.person.create({ data })
}
```

## 5. Docker 構成

### 5.1 マルチコンテナ戦略

```yaml
# docker-compose.yml
services:
  apps: # Node.js（Nuxt + Express）統合コンテナ
  db: # MySQL
```

### 5.2 保守性の考慮

#### コンテナ設計の利点

- **統合管理**: 単一appsコンテナでのフロント・バック一元運用
- **DB 分離**: MySQL コンテナの独立性保持

**重要**: このアーキテクチャは**保守性**を最優先に設計されています。新機能追加や技術変更時は、この設計原則を維持することを最重要視してください。
