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
apps/backend/src/
├── controllers/     # HTTPレイヤー（薄い層）
├── services/        # ビジネスロジック層
├── repositories/    # データアクセス層（抽象化）
├── routes/          # ルーティング定義
├── middlewares/     # 横断的関心事
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
  "isSuccess": true,
  "data": {}
}
```

#### エラーレスポンス

```json
{
  "isSuccess": false,
  "error": {
    "statusCode": 400,
    "errorCode": "VALIDATION_ERROR",
    "details": [
      {
        "field": "name",
        "message": "Name must be a string"
      }
    ]
  }
}
```

## API設計

**ヘッダー**

```
Authorization: <current-token>
```

## 8. エラーハンドリング

### 8.1 エラーコード一覧

| エラーコード      | HTTP | 説明                   | 発生例                         |
| ----------------- | ---- | ---------------------- | ------------------------------ |
| VALIDATION_ERROR  | 400  | 入力データ検証エラー   | 必須フィールド未入力           |
| UNAUTHORIZED      | 401  | 認証が必要             | トークン未提供                 |
| FORBIDDEN         | 403  | アクセス権限なし       | 他ユーザーのデータへのアクセス |
| NOT_FOUND         | 404  | リソースが見つからない | 存在しない人物IDの指定         |
| CONFLICT          | 409  | データ競合             | 重複関係の作成                 |
| VALIDATION_FAILED | 422  | データ整合性エラー     | 循環参照の作成                 |
| INTERNAL_ERROR    | 500  | サーバー内部エラー     | 予期しないサーバーエラー       |
| DATABASE_ERROR    | 500  | データベースエラー     | DB接続エラー                   |

### 8.2 詳細エラーレスポンス例

```json
{
  "isSuccess": false,
  "error": {
    "statusCode": 400,
    "errorCode": "VALIDATION_ERROR",
    "details": [
      {
        "field": "gender",
        "message": "性別を選択してください。"
      },
      {
        "field": "birthDate",
        "message": "生年月日はYYYY-MM-DD形式で入力してください。"
      }
    ]
  }
}
```

**重要**: このAPI設計は**保守性**を最優先に設計されています。新機能追加やデータ構造変更時は、既存APIの互換性を維持することを最重要視してください。
