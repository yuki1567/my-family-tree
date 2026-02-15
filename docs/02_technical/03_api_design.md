# API設計書

## 1. API設計方針

### 1.1 基本方針

保守性を最優先とした設計：

- **一貫性**: 統一されたレスポンス形式・エラーハンドリング
- **拡張性**: バージョニング・新機能追加への対応
- **型安全性**: Drizzle ORM型とのシームレスな連携
- **可読性**: 明確なエンドポイント設計

### 1.2 レイヤー構成

Routes（ルーティング + Zodバリデーション）→ Services（ビジネスロジック）→ Repositories（データアクセス）

型定義は`apps/shared/api/`で共有し、ZodスキーマからTypeScript型を推論。DB型からAPI型への変換はRepository層でsatisfiesを使用。

> **実ファイル参照**: `apps/backend/routes/`, `apps/backend/services/`, `apps/backend/repositories/`, `apps/shared/api/`

### 1.3 設計原則

- **RESTful設計**: 適切なHTTPメソッド、リソース指向URL、冪等性考慮
- **データ一貫性**: データベース設計との完全な整合性
- **バリデーション**: Zodスキーマの`safeParse()`による統一バリデーション。`@hono/zod-validator`で型安全化

### 1.4 エラーハンドリング設計

3層構造でエラーをハンドリング：

1. **バリデーション層**: `zValidator`ミドルウェアがZodErrorを自動検出し400エラー返却
2. **データベース層**: ルートハンドラーのtry-catchでDrizzle ORMエラーをキャッチし`DatabaseError`でラップ
3. **フォールバック**: `errorHandler`ミドルウェアがその他を`UNKNOWN_ERROR`として500エラー返却

> **実ファイル参照**: `apps/backend/middlewares/errorHandler.ts`, `apps/backend/errors/AppError.ts`

## 2. 共通仕様

### 2.1 ベースURL

- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

### 2.2 認証方式

JWT Token

### 2.3 共通レスポンス形式

- **成功**: `{ "data": {} }`
- **エラー**: `{ "error": { "statusCode", "errorCode", "details": [{ "field", "code" }] } }`

### 2.4 エラーコード一覧

| HTTPステータスコード | エラーコード | 説明 | 発生例 |
|---------------------|-------------|------|--------|
| 400 | VALIDATION_ERROR | 入力データ検証エラー | 必須フィールド未入力 |
| 401 | UNAUTHORIZED | 認証が必要 | トークン未提供 |
| 403 | FORBIDDEN | アクセス権限なし | 他ユーザーのデータへのアクセス |
| 404 | NOT_FOUND | リソースが見つからない | 存在しない人物IDの指定 |
| 500 | INTERNAL_ERROR | サーバー内部エラー | 予期しないサーバーエラー |
| 500 | DATABASE_ERROR | データベースエラー | DB接続エラー |
| 500 | UNEXPECTED_ERROR | 予期しないエラー | システム内部の原因不明エラー |

## 3. API設計

### 人物管理API

#### POST /api/people - 人物追加

新しい人物情報を登録する。

**リクエストフィールド**

| フィールド | 型 | 必須 | 説明 | バリデーション |
|-----------|----|----|------|---------------|
| name | string | No | 氏名 | 100文字以内 |
| gender | number | No | 性別（デフォルト:0） | 0:不明, 1:男性, 2:女性 |
| birthDate | string | No | 生年月日 | YYYY-MM-DD形式 |
| deathDate | string | No | 没年月日 | YYYY-MM-DD形式 |
| birthPlace | string | No | 出生地 | 200文字以内 |

**成功レスポンス**: 201 - 作成された人物データ（id, name, gender, birthDate, deathDate, birthPlace）

**固有エラーコード**

| HTTPステータス | エラーコード | フィールド | 詳細コード | 発生条件 |
|---------------|-------------|-----------|-----------|---------|
| 400 | VALIDATION_ERROR | name | NAME_TOO_LONG | 氏名が100文字超過 |
| 400 | VALIDATION_ERROR | gender | INVALID_GENDER | 性別が0,1,2以外 |
| 400 | VALIDATION_ERROR | birthDate | INVALID_DATE_FORMAT | YYYY-MM-DD形式でない |
| 400 | VALIDATION_ERROR | deathDate | INVALID_DATE_FORMAT | YYYY-MM-DD形式でない |
| 400 | VALIDATION_ERROR | deathDate | DEATH_BEFORE_BIRTH | 没年月日が生年月日より前 |
| 400 | VALIDATION_ERROR | birthPlace | BIRTH_PLACE_TOO_LONG | 出生地が200文字超過 |
| 500 | DATABASE_ERROR | - | - | データベース操作エラー |

> **実ファイル参照**: `apps/backend/routes/peopleRoute.ts`
