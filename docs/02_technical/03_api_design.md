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
├── repositories/    # データアクセス層（Prisma）
└── routes/          # ルーティング定義
```

#### 型定義との連携
```typescript
// Prisma生成型を直接使用
import { Person, Relationship, User } from '@prisma/client'

// APIレスポンス型の定義
export type PersonWithRelations = Person & {
  relationships: {
    parents: Array<{ id: string; name: string; type: number }>
    children: Array<{ id: string; name: string; type: number }>
  }
}
```

### 1.3 設計原則

#### RESTful設計
- 適切なHTTPメソッドの使用
- リソース指向のURL設計
- 冪等性の考慮

#### データ一貫性
- データベース設計との完全な整合性
- バリデーション層での型安全性確保

## 2. 共通仕様

### 2.1 ベースURL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

### 2.2 認証方式
- **Phase 1**: 認証なし（ローカル環境）
- **Phase 2**: JWT Bearer Token

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

### 2.4 データ型マッピング

#### 性別（gender）
- `0`: 不明
- `1`: 男性  
- `2`: 女性

#### 関係タイプ（type）
- `1`: 生物学的関係
- `2`: 養子縁組関係

#### 共通フィールド
- `id`: UUID（string）
- `created_at`: ISO 8601形式（string）
- `updated_at`: ISO 8601形式（string）

## 3. 人物管理API

### 3.1 人物一覧取得
```http
GET /api/people
```

**クエリパラメータ**
- `page` (number, optional): ページ番号（デフォルト: 1）
- `limit` (number, optional): 取得件数（デフォルト: 10、最大: 100）

**レスポンス**
```json
{
  "isSuccess": true,
  "data": [
    {
      "id": "uuid",
      "name": "田中太郎",
      "gender": 1,
      "birthDate": "1980-01-01",
      "deathDate": null,
      "birthPlace": "東京都",
      "photo": "profile_image_001.jpg",
      "memo": "エピソード",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### 3.2 人物詳細取得
```http
GET /api/people/:id
```

**パラメータ**
- `id` (string, required): 人物ID（UUID）

**レスポンス**
```json
{
  "isSuccess": true,
  "data": {
    "id": "uuid",
    "name": "田中太郎",
    "gender": 1,
    "birthDate": "1980-01-01",
    "deathDate": null,
    "birthPlace": "東京都",
    "photo": "profile_image_001.jpg",
    "memo": "エピソード",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "relationships": {
      "parents": [
        {
          "relationshipId": "rel-uuid",
          "person": {
            "id": "parent-uuid",
            "name": "田中一郎"
          },
          "type": 1
        }
      ],
      "children": [
        {
          "relationshipId": "rel-uuid",
          "person": {
            "id": "child-uuid",
            "name": "田中次郎"
          },
          "type": 1
        }
      ]
    }
  }
}
```

### 3.3 人物作成
```http
POST /api/people
```

**リクエストボディ**
```json
{
  "name": "田中太郎",
  "gender": 1,
  "birthDate": "1980-01-01",
  "deathDate": null,
  "birthPlace": "東京都",
  "photo": null,
  "memo": "エピソード"
}
```

**バリデーションルール**
- `name`: string, optional, max 100文字
- `gender`: number, optional, 0-2の範囲
- `birthDate`: ISO date string (YYYY-MM-DD), optional
- `deathDate`: ISO date string (YYYY-MM-DD), optional
- `birthPlace`: string, optional, max 200文字
- `photo`: string (filename), optional, max 255文字
- `memo`: string, optional, max 2000文字

**レスポンス**
```json
{
  "isSuccess": true,
  "data": {
    "id": "new-uuid",
    "name": "田中太郎",
    "gender": 1,
    "birthDate": "1980-01-01",
    "deathDate": null,
    "birthPlace": "東京都",
    "photo": null,
    "memo": "エピソード",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3.4 人物更新
```http
PUT /api/people/:id
```

**パラメータ**
- `id` (string, required): 人物ID（UUID）

**リクエストボディ**
```json
{
  "name": "田中太郎（更新）",
  "gender": 1,
  "birthDate": "1980-01-01",
  "deathDate": null,
  "birthPlace": "東京都",
  "photo": "new_profile_image.jpg",
  "memo": "更新されたエピソード"
}
```

**バリデーションルール**
- 作成時と同様のルール
- 全フィールド任意（部分更新対応）
- `deathDate >= birthDate` の制約

### 3.5 人物削除
```http
DELETE /api/people/:id
```

**パラメータ**
- `id` (string, required): 人物ID（UUID）

**レスポンス**
```json
{
  "isSuccess": true
}
```

**注意**
- 関連する関係（relationships）も自動的に削除（CASCADE）

## 4. 関係管理API

### 4.1 関係一覧取得
```http
GET /api/relationships
```

**クエリパラメータ**
- `parentId` (string, optional): 特定の親の関係のみ取得
- `childId` (string, optional): 特定の子の関係のみ取得
- `type` (number, optional): 関係タイプフィルタ（1 or 2）

**レスポンス**
```json
{
  "isSuccess": true,
  "data": [
    {
      "id": "rel-uuid",
      "parentId": "parent-uuid",
      "childId": "child-uuid",
      "type": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "parent": {
        "id": "parent-uuid",
        "name": "田中一郎",
        "gender": 1
      },
      "child": {
        "id": "child-uuid",
        "name": "田中太郎",
        "gender": 1
      }
    }
  ]
}
```

### 4.2 関係作成
```http
POST /api/relationships
```

**リクエストボディ**
```json
{
  "parentId": "parent-uuid",
  "childId": "child-uuid",
  "type": 1
}
```

**バリデーションルール**
- `parentId`: string, required, 存在する人物ID
- `childId`: string, required, 存在する人物ID  
- `type`: number, required, 1 or 2
- 重複関係チェック
- 自己参照防止チェック
- 循環参照チェック

**レスポンス**
```json
{
  "isSuccess": true,
  "data": {
    "id": "new-rel-uuid",
    "parentId": "parent-uuid",
    "childId": "child-uuid",
    "type": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4.3 関係削除
```http
DELETE /api/relationships/:id
```

**パラメータ**
- `id` (string, required): 関係ID（UUID）

**レスポンス**
```json
{
  "isSuccess": true
}
```

## 5. 検索API（Phase 2）

### 5.1 人物検索
```http
GET /api/search/people
```

**クエリパラメータ**
- `q` (string, optional): 検索クエリ（名前、出生地、メモ）
- `gender` (number, optional): 性別フィルタ（0, 1, 2）
- `birthYear` (number, optional): 生年フィルタ
- `birthPlace` (string, optional): 出生地フィルタ
- `limit` (number, optional): 結果件数制限（デフォルト: 10）
- `offset` (number, optional): オフセット（デフォルト: 0）

**レスポンス**
```json
{
  "isSuccess": true,
  "data": {
    "results": [
      {
        "id": "uuid",
        "name": "田中太郎",
        "gender": 1,
        "birthDate": "1980-01-01",
        "birthPlace": "東京都",
        "memo": "エピソード"
      }
    ],
    "total": 1,
    "limit": 10,
    "offset": 0
  }
}
```

### 5.2 関係検索
```http
GET /api/search/relationships
```

**クエリパラメータ**
- `personId` (string, required): 基準となる人物ID
- `relation` (string, optional): 関係タイプ ['parents', 'children', 'siblings', 'ancestors', 'descendants']
- `generation` (number, optional): 世代数制限

## 6. データ管理API

### 6.1 データエクスポート
```http
GET /api/export
```

**クエリパラメータ**
- `format` (string, optional): エクスポート形式 ['json']（デフォルト: json）

**レスポンス**
```json
{
  "isSuccess": true,
  "data": {
    "exportDate": "2024-01-01T00:00:00.000Z",
    "people": [
      {
        "id": "uuid",
        "name": "田中太郎",
        "gender": 1,
        "birthDate": "1980-01-01",
        "deathDate": null,
        "birthPlace": "東京都",
        "photo": null,
        "memo": "エピソード"
      }
    ],
    "relationships": [
      {
        "id": "rel-uuid",
        "parentId": "parent-uuid",
        "childId": "child-uuid",
        "type": 1
      }
    ],
    "metadata": {
      "version": "1.0",
      "totalPeople": 100,
      "totalRelationships": 150
    }
  }
}
```

### 6.2 データインポート
```http
POST /api/import
```

**リクエストボディ**
```json
{
  "data": {
    "people": [...],
    "relationships": [...],
    "metadata": {...}
  },
  "options": {
    "overwrite": false,
    "validateData": true
  }
}
```

## 7. 認証API（Phase 2）

### 7.1 ユーザー登録
```http
POST /api/auth/register
```

**リクエストボディ**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "ユーザー名"
}
```

**バリデーションルール**
- `email`: string, required, 有効なメールアドレス形式
- `password`: string, required, 8文字以上
- `name`: string, required, max 100文字

### 7.2 ログイン
```http
POST /api/auth/login
```

**リクエストボディ**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**レスポンス**
```json
{
  "isSuccess": true,
  "data": {
    "token": "jwt-token",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "ユーザー名",
      "emailVerified": 0,
      "isActive": 1
    }
  }
}
```

### 7.3 トークンリフレッシュ
```http
POST /api/auth/refresh
```

**ヘッダー**
```
Authorization: Bearer <current-token>
```

## 8. エラーハンドリング

### 8.1 エラーコード一覧

| エラーコード | HTTP | 説明 | 発生例 |
|-------------|------|------|--------|
| VALIDATION_ERROR | 400 | 入力データ検証エラー | 必須フィールド未入力 |
| UNAUTHORIZED | 401 | 認証が必要 | トークン未提供 |
| FORBIDDEN | 403 | アクセス権限なし | 他ユーザーのデータへのアクセス |
| NOT_FOUND | 404 | リソースが見つからない | 存在しない人物IDの指定 |
| CONFLICT | 409 | データ競合 | 重複関係の作成 |
| VALIDATION_FAILED | 422 | データ整合性エラー | 循環参照の作成 |
| INTERNAL_ERROR | 500 | サーバー内部エラー | 予期しないサーバーエラー |
| DATABASE_ERROR | 500 | データベースエラー | DB接続エラー |

### 8.2 詳細エラーレスポンス例

#### バリデーションエラー
```json
{
  "isSuccess": false,
  "error": {
    "statusCode": 400,
    "errorCode": "VALIDATION_ERROR",
    "details": [
      {
        "field": "gender",
        "message": "Gender must be 0, 1, or 2"
      },
      {
        "field": "birthDate",
        "message": "Birth date must be in YYYY-MM-DD format"
      }
    ]
  }
}
```

#### ビジネスロジックエラー
```json
{
  "isSuccess": false,
  "error": {
    "statusCode": 422,
    "errorCode": "VALIDATION_FAILED",
    "details": [
      {
        "field": "parentId",
        "message": "Adding this relationship would create a circular reference"
      }
    ]
  }
}
```

## 9. 実装レイヤー設計

### 9.1 Controller層
```typescript
// apps/backend/src/controllers/personController.ts
export const createPerson = async (req: Request, res: Response) => {
  try {
    const personData = req.body
    const result = await personService.create(personData)
    
    res.status(201).json({
      isSuccess: true,
      data: result
    })
  } catch (error) {
    next(error) // エラーミドルウェアに委譲
  }
}
```

### 9.2 Service層
```typescript
// apps/backend/src/services/personService.ts
export const create = async (data: CreatePersonInput): Promise<Person> => {
  // バリデーション
  validatePersonData(data)
  
  // ビジネスロジック
  if (data.deathDate && data.birthDate && data.deathDate < data.birthDate) {
    throw new ValidationError('Death date must be after birth date')
  }
  
  // データ永続化
  return await personRepository.create(data)
}
```

### 9.3 Repository層
```typescript
// apps/backend/src/repositories/personRepository.ts
export const create = async (data: CreatePersonInput): Promise<Person> => {
  return await prisma.person.create({
    data: {
      ...data,
      id: uuidv4()
    }
  })
}
```

## 10. バージョニング戦略

### 10.1 APIバージョニング
```
/api/v1/people    # Version 1
/api/v2/people    # Version 2 (将来)
```

### 10.2 下位互換性の維持
- 既存フィールドの削除禁止
- 新フィールドは任意項目として追加
- データ型変更時の適切な変換処理

---

**重要**: このAPI設計は**保守性**を最優先に設計されています。新機能追加やデータ構造変更時は、既存APIの互換性を維持することを最重要視してください。