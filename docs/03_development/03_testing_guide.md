# テストガイド

## テスト戦略概要

本プロジェクトでは、レイヤードアーキテクチャ（Controller/Service/Repository）に基づいた効率的なテスト戦略を採用しています。

### テスト分類と構成比率

```
統合テスト (Integration) - 60%
└── API エンドポイントテスト（全レイヤー + DB連携）

単体テスト (Unit) - 40%
├── Service層 ビジネスロジック
├── Validation スキーマ
└── Utility Functions
```

## 単体テスト (Unit Tests)

### テスト対象

#### ✅ テストする対象

- **Service層**: ビジネスロジック（Repository をモック化）
- **Validation**: `validations/` フォルダ内のZodスキーマ
- **Utility Functions**: `utils/` フォルダ内のヘルパー関数

#### ❌ テストしない対象

- **Config**: 環境変数の読み込みのみでビジネスロジックがない
- **Routes**: HTTPレイヤーのため統合テストで検証
- **Controller**: Request/Responseに依存するため統合テストで検証
- **Repository**: PrismaClientのモック化は実際のDB操作を検証できないため

### 使用ツール

- **Jest** + **ts-jest**: テストフレームワーク
- **モック**: Repository層の外部依存をモック

### 実装例

```typescript
// __tests__/unit/services/personService.test.ts
describe('PersonService', () => {
  const createMockRepository = () =>
    ({
      create: jest.fn(),
      findById: jest.fn(),
    }) as jest.Mocked<PersonRepository>

  describe('create', () => {
    it('有効なデータの場合、人物を作成できるか', async () => {
      const mockRepository = createMockRepository()
      const service = new PersonService(mockRepository)

      mockRepository.create.mockResolvedValue(mockPersonData)

      const result = await service.create(validPersonData)

      expect(result).toEqual(mockPersonData)
      expect(mockRepository.create).toHaveBeenCalledWith(validPersonData)
    })
  })
})
```

## 統合テスト (Integration Tests)

### 統合テストの設計原則

統合テストは**API全体の疎通確認**が目的です。詳細なバリデーションテストは単体テストに任せ、統合テストでは以下に集中します：

#### ✅ 統合テストで検証すべき内容

- **API疎通**: HTTPリクエスト/レスポンスの正常動作
- **レイヤー間連携**: Controller → Service → Repository → DB の全体フロー
- **代表的なエラーハンドリング**: 主要なエラーパターンの動作確認

#### ❌ 統合テストで詳細テストすべきでない内容

- **バリデーション詳細**: 全パターンのバリデーションエラー
- **エッジケース**: 境界値や特殊ケースの細かい検証
- **未使用フィールド**: APIレスポンスに含まれないフィールドのテスト

### 統合テスト設計のベストプラクティス

#### APIレスポンステストの注意点

```typescript
// ❌ 悪い例：APIレスポンスに含まれないフィールドをテスト
it('人物作成時、タイムスタンプが設定されないことを確認', async () => {
  const response = await request(app).post('/api/people').send(data)

  expect(response.body.data.createdAt).toBeUndefined() // 不要
  expect(response.body.data.updatedAt).toBeUndefined() // 不要
})

// ✅ 良い例：APIレスポンス仕様に基づくテスト
it('有効なデータの場合、201ステータスでレスポンスを返すか', async () => {
  const response = await request(app).post('/api/people').send(data)

  expect(response.status).toBe(201)
  expect(response.body).toEqual({
    isSuccess: true,
    data: {
      id: expect.any(String),
      name: '田中花子',
      gender: 2,
      birthDate: '1985-05-15',
      deathDate: '2020-12-31',
      birthPlace: '大阪府',
    },
  })
})
```

#### バリデーションデフォルト値のテスト

```typescript
// ✅ 良い例：バリデーション層のデフォルト値を活用
it('最小限のデータの場合、201ステータスでレスポンスを返すか', async () => {
  const requestData = {} // フィールドを省略してデフォルト値をテスト

  const response = await request(app).post('/api/people').send(requestData)

  expect(response.body.data.gender).toBe(0) // デフォルト値の確認
})

// ❌ 悪い例：不要な明示的値設定
it('最小限のデータの場合...', async () => {
  const requestData = { gender: 0 } // デフォルト値なので不要
})
```

#### エラーテストの適切な粒度

```typescript
// ✅ 良い例：代表的なバリデーションエラー1つで十分
describe('異常系', () => {
  it('バリデーションエラーの場合、400エラーを返すか', async () => {
    const requestData = {
      name: 'テスト',
      gender: 3, // 無効な性別（代表例）
    }

    const response = await request(app).post('/api/people').send(requestData)

    expect(response.status).toBe(400)
    expect(response.body.error.errorCode).toBe('VALIDATION_ERROR')
  })
})

// ❌ 悪い例：統合テストでの詳細バリデーションテスト
describe('異常系', () => {
  it('性別が無効な値の場合...', () => {}) // 単体テストでカバー
  it('日付形式が無効な場合...', () => {}) // 単体テストでカバー
  it('名前が101文字の場合...', () => {}) // 単体テストでカバー
  it('没年月日が生年月日より前の場合...', () => {}) // 単体テストでカバー
})
```

### 重要：並列実行とデータ競合の問題

**統合テストは必ず直列実行（`--runInBand`）で実行してください。**

#### 問題

Jestはデフォルトで並列実行されます。統合テストで各テスト前に `await prisma.people.deleteMany()` を実行すると、以下の問題が発生します：

```typescript
// ❌ 危険：並列実行時の問題例
describe('Test A', () => {
  beforeEach(async () => {
    await prisma.people.deleteMany() // すべてのデータを削除
  })

  it('should create person', async () => {
    // テスト実行中...
  })
})

describe('Test B', () => {
  beforeEach(async () => {
    await prisma.people.deleteMany() // Test Aの実行中にデータを削除！
  })

  it('should update person', async () => {
    // Test Aで作成したデータが消されてテスト失敗
  })
})
```

#### 解決策

```bash
# ✅ 正しい実行方法
npm run test:integration  # --runInBand フラグで直列実行
```

```json
// package.json
{
  "scripts": {
    "test:integration": "jest --testPathPattern=integration --runInBand"
  }
}
```

#### データ管理戦略

- **統合テスト**: 直列実行で各テスト前にクリーンアップ
- **単体テスト**: モック使用で並列実行可能
- **テスト分離**: 各テストは独立したデータセットで実行

## テスト用データベースのセットアップ

### マイグレーション実行タイミング

**マイグレーションはテスト用DBコンテナ初回起動時に1度だけ実行します。**

#### ❌ 間違った方法

```typescript
// 毎回マイグレーション実行は不要かつ非効率
describe('POST /api/people', () => {
  beforeAll(async () => {
    // テスト用DBマイグレーション実行 ← 不要
    await prisma.$connect()
  })
})
```

#### ✅ 正しい方法

```bash
# テスト用DBコンテナ起動時に初期化
docker-compose -f docker-compose.test.yml up -d

# 初回のみマイグレーション実行
docker-compose exec apps npm run db:migrate

# その後はデータクリーンアップのみでテスト実行
npm run test:integration
```

### なぜ毎回マイグレーションが不要か

1. **スキーマは変わらない**: テスト実行中にテーブル構造は変更されない
2. **データのみクリーンアップ**: `deleteMany()` でデータリセットで十分
3. **実行時間短縮**: マイグレーション実行時間を節約
4. **コンテナ永続化**: テスト用DBコンテナは開発セッション中は起動したまま

### 実装例

```typescript
// __tests__/integration/personApi.test.ts
import request from 'supertest'
import { createApp } from '@/app'
import { prisma } from '@/config/database'

describe('POST /api/people', () => {
  let app: Express

  beforeAll(async () => {
    app = createApp()
    await prisma.$connect()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    await prisma.people.deleteMany()
  })

  it('有効なデータの場合、人物を正常に作成できるか', async () => {
    const response = await request(app).post('/api/people').send({
      name: 'テスト太郎',
      gender: 1,
      birthDate: '1990-01-01',
    })

    expect(response.status).toBe(201)
    expect(response.body.isSuccess).toBe(true)
    expect(response.body.data).toHaveProperty('id')

    const createdId = response.body.data.id
    const dbRecord = await prisma.people.findUnique({
      where: { id: createdId },
    })

    expect(dbRecord).toBeDefined()
    expect(dbRecord).toMatchObject({
      name: 'テスト太郎',
      gender: 1,
      birthDate: new Date('1990-01-01'),
    })
  })
})
```

## DB検証の効率的なアプローチ

### なぜDB検証が必須か

統合テストでは**APIレスポンス検証 + DB状態検証の両方**が必要です：

1. **データ永続化確認**: APIが成功レスポンスを返してもDB保存に失敗する可能性
2. **Repository層のテスト**: 実際のSQL実行とPrismaマッピングの検証
3. **データ変換検証**: API形式とDB保存形式の変換処理確認
4. **制約・関連性**: DB制約や外部キー関連の動作確認

### 効率的な検証パターン

#### ✅ 推奨：作成IDを使った検証

```typescript
const createdId = response.body.data.id
const dbRecord = await prisma.people.findUnique({
  where: { id: createdId },
})
```

#### ❌ 非効率：全件検索

```typescript
// 全データから検索は非効率
const dbRecord = await prisma.people.findFirst({
  where: { name: 'テスト太郎' },
})
```

### 検証レベルの使い分け

**基本検証（最小限）:**

```typescript
expect(dbRecord).toBeDefined()
expect(dbRecord?.name).toBe('テスト太郎')
```

**詳細検証（重要フィールド）:**

```typescript
expect(dbRecord).toMatchObject({
  name: 'テスト太郎',
  gender: 1,
  birthDate: new Date('1990-01-01'),
  createdAt: expect.any(Date),
  updatedAt: expect.any(Date),
})
```

## テスト用Docker構成（Profiles使用）

### Docker Compose Profilesによる環境分離

同一`docker-compose.yml`ファイル内で、profilesを使用してテスト環境を分離できます。

#### docker-compose.yml構成例

```yaml
# docker-compose.yml
version: '3.8'

services:
  apps:
    build:
      context: .
      dockerfile: docker/apps/Dockerfile
    working_dir: /usr/src
    ports:
      - '3000:3000'
      - '4000:4000'
    volumes:
      - ./apps:/usr/src/apps
    environment:
      - TZ=Asia/Tokyo
    env_file:
      - .env
    depends_on:
      - db

  # 開発用データベース
  db:
    build:
      context: .
      dockerfile: docker/db/Dockerfile
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=${MYSQL_DATABASE}
      - MYSQL_USER=${MYSQL_USER}
      - MYSQL_PASSWORD=${MYSQL_PASSWORD}
      - TZ=Asia/Tokyo
    env_file:
      - .env
    ports:
      - '${MYSQL_PORT}:3306'
    volumes:
      - ./docker/db/init.sql:/docker-entrypoint-initdb.d/init.sql

  # テスト用データベース（profilesで制御）
  test-db:
    build:
      context: .
      dockerfile: docker/db/Dockerfile
    environment:
      - MYSQL_ROOT_PASSWORD=testpass
      - MYSQL_DATABASE=family_tree_test
      - MYSQL_USER=testuser
      - MYSQL_PASSWORD=testpass
      - TZ=Asia/Tokyo
    ports:
      - '3307:3306'
    tmpfs:
      - /var/lib/mysql # メモリ上での高速実行
    profiles: ['test'] # テストプロファイル指定
```

#### 実行方法

```bash
# 通常の開発環境起動（apps + db のみ）
docker-compose up -d

# テスト環境起動（apps + db + test-db）
docker-compose --profile test up -d

# テスト用DBのみ起動
docker-compose --profile test up test-db -d
```

### Profilesを使用するメリット

1. **一元管理**: 開発・テスト環境を一つのファイルで管理
2. **設定共有**: 共通部分（apps）は重複せず記述
3. **明示的起動**: 誤ってテスト用DBが起動することを防止
4. **CI/CD対応**: プロファイル指定で柔軟な環境構築

### テスト実行の流れ

**半自動化されたテスト実行**

テスト実行前にテスト用DBの起動確認が必要です：

```bash
# 1. テスト用DB起動確認・起動
docker-compose ps test-db
docker-compose --profile test up test-db -d

# 2. テスト実行（モノレポ構造）
docker-compose exec apps bash -c "cd apps/backend && TEST_DATABASE_URL='mysql://testuser:testpass@localhost:3307/family_tree_test' npm run test:integration"
```

**重要**: 
- このプロジェクトはモノレポ構造のため、backendワークスペース内で実行する必要があります
- テスト用DBコンテナの起動は手動で行います（Dockerコンテナ内からのdocker-compose実行制約のため）

Jest GlobalSetupで以下が自動実行されます：
1. DB接続確認（リトライ機能付き）
2. マイグレーション実行

**手動でのテスト環境管理**

必要に応じて手動でも操作可能です：

```bash
# テスト用DB起動（開発セッション中は起動したまま）
docker-compose --profile test up test-db -d

# テスト実行（backendワークスペース内で）
docker-compose exec apps bash
cd apps/backend
npm run test:integration

# 開発セッション終了時のみ停止
docker-compose stop test-db
```

## テスト実行スクリプト

### package.json スクリプト設定

```json
{
  "scripts": {
    "test": "jest --runInBand",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration --runInBand",
    "test:coverage": "jest --coverage --runInBand",
    "test:watch": "jest --watch --testPathPattern=unit",
    "test:setup": "docker-compose --profile test up test-db -d",
    "test:teardown": "docker-compose stop test-db"
  }
}
```

### スクリプト説明

- **`test`**: 全てのテスト実行（単体 + 統合）
- **`test:unit`**: 単体テストのみ実行（並列実行）
- **`test:integration`**: 統合テストのみ実行（直列実行）
- **`test:coverage`**: テストカバレッジレポート付き全テスト実行
- **`test:watch`**: 単体テストのwatch mode
- **`test:setup`**: テスト用DB起動
- **`test:teardown`**: テスト用DB停止

### 実行例

```bash
# 全テスト実行
npm test

# 個別実行
npm run test:unit
npm run test:integration

# 開発時のwatch mode
npm run test:watch
```

## テスト品質について

### テスト設計原則

1. **テスト独立性**: 各テストは他のテストに依存しない
2. **現実的なデータ**: 実際の使用ケースを反映したテストデータ
3. **境界値テスト**: バリデーションの境界条件を重点的にテスト
4. **エラーファースト**: 正常系と異常系の両方を必ずテスト
5. **データ整合性**: DB状態の検証を含むテスト

### カバレッジについて

カバレッジは品質の指標の一つですが、絶対的な目標ではありません：

- **重要な機能**: ビジネスロジックや重要なAPIは十分にテスト
- **リスクベース**: 障害時の影響が大きい部分を重点的にテスト
- **実用的な判断**: 100%カバレッジよりも意味のあるテストを優先
- **継続的改善**: プロジェクトの成熟に応じてテスト戦略を調整

## テスト責任範囲の明確化

### 単体テスト vs 統合テストの責任分担

適切なテスト設計のために、各テストレベルの責任範囲を明確に定義します：

#### 単体テスト（Unit Tests）の責任範囲

**✅ 単体テストで詳細にテストする**

- **バリデーション詳細**: 全てのバリデーションルールとエラーメッセージ
- **ビジネスロジック**: Service層の条件分岐、計算処理
- **境界値テスト**: 文字数制限、数値範囲、日付妥当性の境界値
- **エッジケース**: null/undefined処理、特殊文字処理

```typescript
// 例：バリデーション単体テスト
describe('createPersonSchema', () => {
  it('名前が100文字の場合、バリデーションが通るか', () => {})
  it('名前が101文字の場合、NAME_TOO_LONGエラーが返されるか', () => {})
  it('性別が0,1,2の場合、バリデーションが通るか', () => {})
  it('性別が3の場合、INVALID_GENDERエラーが返されるか', () => {})
  it('没年月日が生年月日より前の場合、DEATH_BEFORE_BIRTHエラーが返されるか', () => {})
})
```

#### 統合テスト（Integration Tests）の責任範囲

**✅ 統合テストで検証する**

- **API疎通**: HTTPリクエスト/レスポンスの基本動作
- **全レイヤー連携**: Controller → Service → Repository → DB のフロー
- **代表的なエラー**: 主要なエラーパターン1つずつ
- **データ永続化**: DBへの正常な保存・取得

```typescript
// 例：統合テスト
describe('POST /api/people', () => {
  describe('正常系', () => {
    it('有効なデータの場合、201ステータスでレスポンスを返すか', () => {})
    it('最小限のデータの場合、201ステータスでレスポンスを返すか', () => {})
  })

  describe('異常系', () => {
    it('バリデーションエラーの場合、400エラーを返すか', () => {}) // 代表例1つ
  })
})
```

**重要**: テスト数よりも**品質**を重視し、意味のあるテストケースを選択してください。
