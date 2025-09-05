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

## 2. プロジェクト構造

```
family-tree-app/                    # ルートワークスペース
├── package.json                    # 依存関係の統合管理
├── tsconfig.json                   # TypeScript基本設定
├── docker-compose.yml              # 開発環境オーケストレーション
├── ecosystem.config.cjs            # PM2統合プロセス管理設定
├── CLAUDE.md                       # AI開発者向けドキュメント
│
├── docker/                         # コンテナ定義（環境別）
│   ├── apps/                       # アプリケーションコンテナ（※appsに変更）
│   │   ├── Dockerfile              # Node.js + PM2 + 開発ツール
│   │   └── entrypoint.sh           # 起動スクリプト
│   └── db/                         # データベースコンテナ
│       ├── Dockerfile              # MySQL 8.4.6
│       └── my.cnf                  # MySQL設定
│
├── shared/                         # フロント・バック共有資産
│   ├── types/                      # 共通型定義
│   └── constants/                  # 共通定数
│
└── apps/                           # 個別アプリケーション
    ├── frontend/                   # Nuxt 3 SPA
    └── backend/                    # Express + Prisma API
```

### 2.1 共有レイヤー（shared/）

#### 設計思想

フロントエンド・バックエンド間の**型安全性**と**一貫性**を保証

```typescript
shared/
├── types/
│   ├── request.ts              # API リクエスト型
│   ├── response.ts             # API レスポンス型
│   └── domain.ts               # ドメインモデル型
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

#### 状態管理の分離

```typescript
store/
├── person.ts                  # 人物データ管理
├── relationship.ts            # 関係性データ管理
├── familyTree.ts             # 家系図表示状態
└── ui.ts                     # UI状態（モーダル等）
```

## 4. バックエンド構成（apps/backend/）

### 4.1 Clean Architecture + Express

```typescript
backend/src/
├── controllers/               # HTTPレイヤー（薄い層）
├── services/                  # ビジネスロジック層
├── repositories/              # データアクセス層（Prisma）
├── routes/                    # ルーティング定義
├── middlewares/               # 横断的関心事
└── prisma/                    # スキーマ・マイグレーション
```

### 4.2 レイヤー分離の理由

#### 保守性の観点

- **単一責任**: 各レイヤーが 1 つの責任のみを持つ
- **依存関係の制御**: 上位層から下位層への単方向依存
- **テスト容易性**: 各層の独立したテスト実装

#### 具体的な責任分担

```typescript
// Controller: HTTPリクエスト・レスポンスの変換のみ
export const createPerson = async (req: Request, res: Response) => {
  const result = await personService.create(req.body);
  res.json(result);
};

// Service: ビジネスルール・バリデーション
export const create = async (data: CreatePersonData) => {
  validatePersonData(data);
  return await personRepository.create(data);
};

// Repository: データアクセスのみ
export const create = async (data: CreatePersonData) => {
  return await prisma.person.create({ data });
};
```

## 5. Docker 構成

### 5.1 マルチコンテナ戦略

```yaml
# docker-compose.yml
services:
  apps: # Node.js（Nuxt + Express）統合コンテナ
    build: 
      dockerfile: ./docker/apps/Dockerfile
    working_dir: /usr/src
    volumes:
      - ./apps:/usr/src/apps  # 部分ボリュームマウント
  db: # MySQL
    build: ./docker/db
```

### 5.2 保守性の考慮

#### コンテナ設計の利点

- **統合管理**: 単一appsコンテナでのフロント・バック一元運用
- **部分マウント**: 必要最小限のファイル同期によるパフォーマンス向上
- **開発効率**: vim等の開発ツール統合、コンテナ内直接編集対応
- **DB 分離**: MySQL コンテナの独立性保持

#### 設定の外部化とパス統一

```bash
# 環境変数による設定管理
DATABASE_URL=${DATABASE_URL}
JWT_SECRET=${JWT_SECRET}

# コンテナ内パス統一
WORKDIR /usr/src              # Docker作業ディレクトリ
PM2_CWD /usr/src             # PM2作業ディレクトリ
VOLUME ./apps:/usr/src/apps   # 部分ボリュームマウント
```

## 6. 技術スタック

### 6.1 選定基準

**保守性を最優先とした技術選択**

| 技術       | 選定理由     | 保守性への寄与         |
| ---------- | ------------ | ---------------------- |
| TypeScript | 型安全性     | コンパイル時エラー検出 |
| Nuxt 3     | 設定より規約 | 一貫した開発パターン   |
| Prisma     | 型安全な ORM | スキーマ変更の影響追跡 |
| Pinia      | 軽量状態管理 | 複雑な状態の分離管理   |
| Docker     | 環境統一     | 開発・本番環境の一致   |

### 6.2 技術選定の制約

- **UI フレームワーク**: あえて使用しない（カスタム要件への対応）
- **ORM の統一**: Prisma による DB 操作の一元化
- **認証方式**: JWT（ステートレス、スケーラブル）

## 7. 開発・運用戦略

### 7.1 開発フロー

```
1. 共有型定義更新（shared/）
2. バックエンド実装（apps/backend/）
3. フロントエンド実装（apps/frontend/）
4. 統合テスト実行
```

### 7.2 保守性を支える仕組み

#### 自動化による品質担保

- **型チェック**: 全ワークスペースでの一括実行
- **Lint**: 統一されたコーディング規約
- **テスト**: 各レイヤーでの独立テスト

#### デプロイ戦略

- **段階的デプロイ**: backend → frontend の順次展開
- **ロールバック**: 各アプリケーション独立でのバージョン管理

## 8. 非機能要件への対応

### 8.1 パフォーマンス

- **コード分割**: Nuxt 3 の自動分割機能
- **状態最適化**: Pinia による効率的な状態更新
- **DB 最適化**: Prisma による型安全なクエリ最適化

### 8.2 セキュリティ

- **認証基盤**: JWT + Express middleware
- **入力検証**: Zod による型安全なバリデーション
- **CORS 設定**: 環境別の適切な Origin 制御

### 8.3 拡張性

- **水平分散**: Docker による複数インスタンス起動
- **機能追加**: 新しい service クラスの追加
- **DB 変更**: Prisma migration による段階的スキーマ変更

## 9. 今後の展望

### 9.1 Phase 別アーキテクチャ進化

#### Phase 1（MVP）

- 現在のモノレポ構成での基本機能実装
- ローカル開発環境の安定化

#### Phase 2（機能拡張）

- マイクロサービス化の検討
- 外部サービス連携（AWS S3）

#### Phase 3（最適化）

- CDN 導入による配信最適化
- 監視・ログ基盤の整備

### 9.2 アーキテクチャ変更時の考慮点

- 既存コードへの影響範囲分析
- 段階的移行戦略の策定
- 後方互換性の維持

---

**重要**: このアーキテクチャは**保守性**を最優先に設計されています。新機能追加や技術変更時は、この設計原則を維持することを最重要視してください。
