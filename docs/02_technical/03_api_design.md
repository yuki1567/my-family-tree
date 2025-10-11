# API設計書

## 1. API設計方針

### 1.1 基本方針

**保守性を最優先とした設計**

- **一貫性**: 統一されたレスポンス形式・エラーハンドリング
- **拡張性**: バージョニング・新機能追加への対応
- **型安全性**: Prisma生成型とのシームレスな連携
- **可読性**: 明確なエンドポイント設計・ドキュメント

### 1.2 モノレポ構成での位置づけ

#### 実装場所

```
apps/backend/
├── controllers/     # HTTPレイヤー（薄い層）
├── services/        # ビジネスロジック層
├── repositories/    # データアクセス層（抽象化）
├── routes/          # ルーティング定義
├── middlewares/     # 横断的関心事（実行処理）
├── validations/     # 入力ルール定義
└── database/        # データベース関連（ORM非依存）
    ├── schema.prisma
    ├── migrations/
    ├── seeds/
    └── config/
```

#### 型定義との連携

```typescript
// 共有レイヤーの型定義を活用
import {
  CreatePersonRequest,
  PersonResponse,
  PersonWithRelationsResponse,
} from '@/shared/types/request'
import { ApiResponse } from '@/shared/types/response'

// APIレスポンス例
export type PersonApiResponse = ApiResponse<PersonResponse>
export type PersonListApiResponse = ApiResponse<PersonResponse[]>
export type PersonWithRelationsApiResponse =
  ApiResponse<PersonWithRelationsResponse>

// データベース層での変換
// Prisma型 → 共有型への変換を Repository層で実施
```

### 1.3 設計原則

#### RESTful設計

- 適切なHTTPメソッドの使用
- リソース指向のURL設計
- 冪等性の考慮

#### データ一貫性

- データベース設計との完全な整合性
- ミドルウェア層でのバリデーション実施

#### バリデーション戦略

**Zodスキーマによる統一バリデーション**

- `safeParse()`による明示的なエラーハンドリング
- 統一エラーレスポンス形式への自動マッピング
- 型安全性とランタイムバリデーションの両立

**実装パターン**

```typescript
// ミドルウェアでのバリデーション
import { validateBody } from '@/middlewares/validate.js'
import { createPersonSchema } from '@/validations/personValidation.js'

router.post('/people', validateBody(createPersonSchema), controller.create)

// validateBodyミドルウェア内部
const result = schema.safeParse(req.body)
if (!result.success) {
  const errorResponse = mapZodErrorToResponse(result.error)
  res.status(400).json(errorResponse)
  return
}
req.body = result.data
next()
```

**エラーマッピング**

- `mapZodErrorToResponse()`ヘルパー関数を使用
- ZodErrorを統一エラーレスポンス形式に変換
- フィールドパスとエラーコードの自動抽出

## 2. 共通仕様

### 2.1 ベースURL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

### 2.2 認証方式

- JWT Token

### 2.3 共通レスポンス形式

#### 成功レスポンス

```json
{
  "data": {}
}
```

#### エラーレスポンス

```json
{
  "error": {
    "statusCode": 400,
    "errorCode": "VALIDATION_ERROR",
    "details": [
      {
        "field": "name",
        "code": "NAME_TOO_LONG"
      }
    ]
  }
}
```

### 2.4 エラーコード一覧

| HTTPステータスコード | エラーコード     | 説明                   | 発生例                         |
| -------------------- | ---------------- | ---------------------- | ------------------------------ |
| 400                  | VALIDATION_ERROR | 入力データ検証エラー   | 必須フィールド未入力           |
| 401                  | UNAUTHORIZED     | 認証が必要             | トークン未提供                 |
| 403                  | FORBIDDEN        | アクセス権限なし       | 他ユーザーのデータへのアクセス |
| 404                  | NOT_FOUND        | リソースが見つからない | 存在しない人物IDの指定         |
| 500                  | INTERNAL_ERROR   | サーバー内部エラー     | 予期しないサーバーエラー       |
| 500                  | DATABASE_ERROR   | データベースエラー     | DB接続エラー                   |
| 500                  | UNEXPECTED_ERROR | 予期しないエラー       | システム内部の原因不明エラー   |

## API設計

### 人物管理API

#### POST /api/people - 人物追加

**概要**: 新しい人物情報を登録する

**リクエスト**

```json
{
  "name": "田中太郎",
  "gender": 1,
  "birthDate": "1990-05-15",
  "deathDate": null,
  "birthPlace": "東京都"
}
```

**フィールド詳細**
| フィールド | 型 | 必須 | 説明 | バリデーション |
|-----------|----|----|------|---------------|
| name | string | ❌ | 氏名 | 100文字以内 |
| gender | number | ❌ | 性別（デフォルト:0） | 0:不明, 1:男性, 2:女性 |
| birthDate | string | ❌ | 生年月日 | YYYY-MM-DD形式 |
| deathDate | string | ❌ | 没年月日 | YYYY-MM-DD形式 |
| birthPlace | string | ❌ | 出生地 | 200文字以内 |

**成功レスポンス (201)**

```json
{
  "data": {
    "id": "uuid-string",
    "name": "田中太郎",
    "gender": 1,
    "birthDate": "1990-05-15",
    "deathDate": null,
    "birthPlace": "東京都"
  }
}
```

**エラーレスポンス例**

```json
{
  "error": {
    "statusCode": 400,
    "errorCode": "VALIDATION_ERROR",
    "details": [
      {
        "field": "gender",
        "code": "INVALID_GENDER"
      },
      {
        "field": "birthDate",
        "code": "INVALID_DATE_FORMAT"
      }
    ]
  }
}
```

**固有エラーコード**

| HTTPステータスコード | メインエラーコード | フィールド | 詳細エラーコード     | 発生条件                       |
| -------------------- | ------------------ | ---------- | -------------------- | ------------------------------ |
| 400                  | VALIDATION_ERROR   | name       | NAME_TOO_LONG        | 氏名が100文字を超過            |
| 400                  | VALIDATION_ERROR   | gender     | INVALID_GENDER       | 性別が0、1、2以外              |
| 400                  | VALIDATION_ERROR   | birthDate  | INVALID_DATE_FORMAT  | 生年月日がYYYY-MM-DD形式でない |
| 400                  | VALIDATION_ERROR   | deathDate  | INVALID_DATE_FORMAT  | 没年月日がYYYY-MM-DD形式でない |
| 400                  | VALIDATION_ERROR   | deathDate  | DEATH_BEFORE_BIRTH   | 没年月日が生年月日より前       |
| 400                  | VALIDATION_ERROR   | birthPlace | BIRTH_PLACE_TOO_LONG | 出生地が200文字を超過          |
| 500                  | DATABASE_ERROR     | -          | -                    | データベース接続・操作エラー   |

**エラーハンドリング実装**

このAPIは以下の3層でエラーをハンドリングします：

1. **バリデーションエラー**: `zValidator`ミドルウェアが自動的にZodErrorを検出し、400エラーとして返却
2. **データベースエラー**: ルートハンドラーのtry-catch文でPrismaエラーをキャッチし、`DatabaseError`でラップして500エラーとして返却
3. **予期しないエラー**: その他のエラーは`errorHandler`ミドルウェアが`UNKNOWN_ERROR`として500エラーで返却

**実装場所**:
- ルートハンドラー: [apps/backend/routes/peopleRoute.ts](../../apps/backend/routes/peopleRoute.ts)
- エラーハンドラー: [apps/backend/middlewares/errorHandler.ts](../../apps/backend/middlewares/errorHandler.ts)
- エラークラス: [apps/backend/errors/AppError.ts](../../apps/backend/errors/AppError.ts)

**重要**: このAPI設計は**保守性**を最優先に設計されています。新機能追加やデータ構造変更時は、既存APIの互換性を維持することを最重要視してください。
