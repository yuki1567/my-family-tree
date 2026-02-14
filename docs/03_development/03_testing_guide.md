# テストガイド

## テスト戦略概要

本プロジェクトでは、フルスタック構成（フロントエンド + バックエンド）に適した包括的なテスト戦略を採用しています。

### アプリケーション構成別テスト戦略

#### バックエンド（Hono + Drizzle ORM）

レイヤードアーキテクチャ（Route/Service/Repository）に基づいたテスト戦略を採用。

#### フロントエンド（Nuxt3 + Vue3）

コンポーネント指向アーキテクチャに基づいたテスト戦略を採用。

### テスト分類と構成比率

#### バックエンドテスト構成比率

```
統合テスト (Integration) - 60%
└── API エンドポイントテスト（全レイヤー + DB連携）

単体テスト (Unit) - 40%
├── Service層 ビジネスロジック
├── Validation スキーマ
└── Utility Functions
```

#### フロントエンドテスト構成比率

```
単体テスト (Unit) - 70%
├── コンポーネントテスト（Props、イベント、算出プロパティ、メソッド）
├── Composables（Vue3の状態管理ロジック）
└── Utility Functions

結合テスト (Integration) - 30%
└── 機能レベルテスト（複数コンポーネント + 状態管理の連携）
```

## 単体テスト (Unit Tests)

### バックエンド単体テスト

#### ✅ テストする対象

- **Service層**: ビジネスロジック（Repository をモック化）
- **Validation**: `validations/` フォルダ内のZodスキーマ
- **Utility Functions**: `utils/` フォルダ内のヘルパー関数

#### ❌ テストしない対象

- **Config**: 環境変数の読み込みのみでビジネスロジックがない
- **Routes**: HTTPレイヤーのため統合テストで検証
- **Repository**: Drizzle ORMクライアントのモック化は実際のDB操作を検証できないため

### フロントエンド単体テスト

#### ✅ テストする対象

- **Vueコンポーネント**: Props、イベント、算出プロパティ、メソッド
- **Composables**: `composables/` フォルダ内のVue3コンポーザブル
- **Utility Functions**: `utils/` フォルダ内のヘルパー関数
- **Store（Pinia）**: 状態管理ロジック（アクション、ゲッター）

#### ❌ テストしない対象

- **Pages**: レイアウトやルーティングが複雑なため統合テストで検証
- **Layouts**: 複数コンポーネントの組み合わせのため統合テストで検証
- **Plugins**: Nuxt3の初期化処理のため統合テストで検証
- **Middleware**: ルーティング制御のため統合テストで検証

### 使用ツール

#### 統一テストフレームワーク: Vitest

**本プロジェクトではフロントエンド・バックエンド共にVitestを採用**

**Vitest選定理由**:

- **フロント・バック統一**: 同一テストフレームワークによる学習コスト削減
- **ESM完全サポート**: package.json `"type": "module"` との完全な互換性
- **高速実行**: Viteベースによる高速起動・実行
- **TypeScript統合**: 追加設定不要でTypeScriptをネイティブサポート
- **Jest互換API**: 既存のJest知識をそのまま活用可能

**Vitest vs Jest比較**:

| 項目 | Vitest | Jest |
|------|--------|------|
| ESM対応 | ネイティブサポート | 追加設定必要 |
| 起動速度 | 高速（Vite） | 遅い |
| TypeScript | 追加設定不要 | ts-jest必要 |
| Vue SFC | ネイティブサポート | 追加設定必要 |
| Node.js API | 完全サポート | 完全サポート |

**バックエンドでのVitest採用理由**:

- **Node.js対応**: サーバーサイドテストも問題なく実行可能
- **Hono統合**: Honoアプリのテストとの連携も良好（app.request()メソッド使用）
- **モック機能**: `vi.fn()`, `vi.mock()`でJestと同等の機能を提供
- **統合テスト**: 実際のPostgreSQL DB（test-db）との統合テストも安定動作

**モック戦略**

- **選定理由**: Repository層の実際のDB操作はテスト環境の複雑化を避けるため
- **実装**: `vi.fn()`を使用したService層テストでのRepository層モック化

**Vue Test Utils**

- **選定理由**: Vue.js公式のコンポーネントテストライブラリ
- **利点**:
  - Vueコンポーネントのレンダリング・Props・イベント検証機能
  - Vue3 Composition API完全対応
  - 公式サポートで安定性と将来性を確保

**Happy DOM**

- **選定理由**: 軽量高速なDOM環境でテスト実行速度を最適化
- **利点**:
  - jsdomより高速（メモリ使用量も削減）
  - Web標準API の十分なサポート
  - Vitestとの組み合わせで最適なパフォーマンス
- **jsdom比較**: 同等の機能でより高速な実行が可能

**モック戦略**

- **対象**: APIクライアント（Composables内のAPI呼び出し）
- **実装**: `vi.mock()`を使用したAPIレスポンスのモック化
- **理由**: 外部API依存を排除し、コンポーネントロジックに集中したテスト

### 実装例

#### バックエンド単体テスト例

```typescript
// __tests__/unit/services/personService.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('PersonService', () => {
  const createMockRepository = () =>
    ({
      create: vi.fn(),
      findById: vi.fn(),
    }) as MockedObject<PersonRepository>

  beforeEach(() => {
    vi.clearAllMocks()
  })

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

#### フロントエンド単体テスト例

```typescript
// __tests__/unit/components/PersonCard.test.ts
import PersonCard from '@/components/PersonCard.vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

describe('PersonCard.vue', () => {
  const mockPerson = {
    id: '1',
    name: '田中太郎',
    gender: 1,
    birthDate: '1990-01-01',
  }

  it('人物情報が正常に表示されるか', () => {
    const wrapper = mount(PersonCard, {
      props: { person: mockPerson },
    })

    expect(wrapper.text()).toContain('田中太郎')
    expect(wrapper.text()).toContain('1990-01-01')
  })

  it('クリック時にイベントが発火されるか', async () => {
    const wrapper = mount(PersonCard, {
      props: { person: mockPerson },
    })

    await wrapper.find('[data-testid="person-card"]').trigger('click')

    expect(wrapper.emitted('person-selected')).toBeTruthy()
    expect(wrapper.emitted('person-selected')?.[0]).toEqual([mockPerson])
  })
})
```

```typescript
// __tests__/unit/composables/usePerson.test.ts
import { usePerson } from '@/composables/usePerson'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('usePerson', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('人物データを正常に取得できるか', async () => {
    const mockApiResponse = {
      id: '1',
      name: '田中太郎',
      gender: 1,
    }

    // API モック
    vi.mock('@/api/person', () => ({
      fetchPerson: vi.fn().mockResolvedValue(mockApiResponse),
    }))

    const { person, loading, fetchPerson } = usePerson()

    await fetchPerson('1')

    expect(loading.value).toBe(false)
    expect(person.value).toEqual(mockApiResponse)
  })
})
```

## 統合テスト (Integration Tests)

### バックエンド統合テスト

#### 統合テストの設計原則

統合テストは**API全体の疎通確認**が目的です。詳細なバリデーションテストは単体テストに任せ、統合テストでは以下に集中します：

#### ✅ 統合テストで検証すべき内容

- **API疎通**: HTTPリクエスト/レスポンスの正常動作
- **レイヤー間連携**: Route → Service → Repository → DB の全体フロー
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

Vitestはデフォルトで並列実行されます。統合テストで各テスト前に `await db.delete(people)` を実行すると、以下の問題が発生します：

```typescript
// ❌ 危険：並列実行時の問題例
describe('Test A', () => {
  beforeEach(async () => {
    await db.delete(people) // すべてのデータを削除
  })

  it('should create person', async () => {
    // テスト実行中...
  })
})

describe('Test B', () => {
  beforeEach(async () => {
    await db.delete(people) // Test Aの実行中にデータを削除！
  })

  it('should update person', async () => {
    // Test Aで作成したデータが消されてテスト失敗
  })
})
```

#### 解決策

```bash
# ✅ 正しい実行方法
npm run test:integration  # poolOptions.threads.singleThread で直列実行
```

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    poolOptions: {
      threads: {
        singleThread: true, // 統合テストは直列実行
      },
    },
  },
})
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
    // Drizzle ORMは自動接続管理
  })
})
```

#### ✅ 正しい方法

```bash
# テスト用DBコンテナ起動時に初期化
docker compose -f docker-compose.test.yml up -d

# 初回のみマイグレーション実行
docker compose exec apps npm run db:migrate

# その後はデータクリーンアップのみでテスト実行
npm run docker:test:integration
```

### なぜ毎回マイグレーションが不要か

1. **スキーマは変わらない**: テスト実行中にテーブル構造は変更されない
2. **データのみクリーンアップ**: `db.delete(people)` でデータリセットで十分
3. **実行時間短縮**: マイグレーション実行時間を節約
4. **コンテナ永続化**: テスト用DBコンテナは開発セッション中は起動したまま

### 実装例

```typescript
// tests/integration/people.test.ts
import { createApp } from '@/app.js'
import { db } from '@/database/client.js'
import { people } from '@/database/schema.js'
import { peopleRoutes } from '@/routes/peopleRoute.js'

describe('POST /api/people', () => {
  const app = createApp()
  app.route('/api', peopleRoutes)

  beforeEach(async () => {
    await db.delete(people)
  })

  it('有効なデータの場合、人物を正常に作成できるか', async () => {
    const response = await app.request('/api/people', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'テスト太郎',
        gender: 1,
        birthDate: '1990-01-01',
      }),
    })

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.data).toHaveProperty('id')
  })
})
```

## DB検証の効率的なアプローチ

### なぜDB検証が必須か

統合テストでは**APIレスポンス検証 + DB状態検証の両方**が必要です：

1. **データ永続化確認**: APIが成功レスポンスを返してもDB保存に失敗する可能性
2. **Repository層のテスト**: 実際のSQL実行とDrizzle ORMマッピングの検証
3. **データ変換検証**: API形式とDB保存形式の変換処理確認
4. **制約・関連性**: DB制約や外部キー関連の動作確認

### 効率的な検証パターン

#### ✅ 推奨：作成IDを使った検証

```typescript
import { eq } from 'drizzle-orm'

const createdId = body.data.id
const [dbRecord] = await db.select().from(people).where(eq(people.id, createdId))
```

#### ❌ 非効率：全件検索

```typescript
// 全データから検索は非効率
const [dbRecord] = await db.select().from(people).where(eq(people.name, 'テスト太郎'))
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
    ports:
      - '5432:5432'

  # テスト用データベース（profilesで制御）
  test-db:
    build:
      context: .
      dockerfile: docker/db/Dockerfile
    ports:
      - '5433:5432'
    tmpfs:
      - /var/lib/postgresql/data # メモリ上での高速実行
    profiles: ['test'] # テストプロファイル指定
```

#### 実行方法

```bash
# 通常の開発環境起動（apps + db のみ）
docker compose up -d

# テスト環境起動（apps + db + test-db）
docker compose --profile test up -d

# テスト用DBのみ起動
docker compose --profile test up test-db -d
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
docker compose ps test-db
docker compose --profile test up test-db -d

# 2. テスト実行（モノレポ構造）
docker compose exec apps bash -c "cd apps/backend && TEST_DATABASE_URL='postgresql://testuser:testpass@test-db:5432/family_tree_test' npm run docker:test:integration"
```

**重要**:

- このプロジェクトはモノレポ構造のため、backendワークスペース内で実行する必要があります
- テスト用DBコンテナの起動は手動で行います（Dockerコンテナ内からのdocker compose実行制約のため）

Vitest GlobalSetupで以下が自動実行されます：

1. DB接続確認（リトライ機能付き）
2. マイグレーション実行

**手動でのテスト環境管理**

必要に応じて手動でも操作可能です：

```bash
# テスト用DB起動（開発セッション中は起動したまま）
docker compose --profile test up test-db -d

# テスト実行（backendワークスペース内で）
docker compose exec apps bash
cd apps/backend
npm run docker:test:integration

# 開発セッション終了時のみ停止
docker compose stop test-db
```

### フロントエンド統合テスト

#### 統合テストの設計原則

フロントエンド統合テストは**ページレベルの動作確認**が目的です。単一コンポーネントの詳細は単体テストに任せ、統合テストでは以下に集中します：

#### ✅ フロントエンド統合テストで検証すべき内容

- **ページレンダリング**: レイアウト + コンポーネントの正常な表示
- **ルーティング**: ページ遷移とパラメータ受け渡し
- **API連携**: データ取得・更新の全体フロー確認
- **ユーザーインタラクション**: 主要な操作フローの動作確認

#### ❌ フロントエンド統合テストで詳細テストすべきでない内容

- **コンポーネント詳細**: Props、イベントの細かい検証
- **バリデーション詳細**: フォーム項目の全パターン検証
- **エラーハンドリング詳細**: 全エラーケースの個別検証

#### フロントエンド統合テスト実装例

```typescript
// __tests__/integration/pages/people.test.ts
import PeoplePage from '@/pages/people.vue'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('People Page Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('人物一覧ページが正常に表示されるか', async () => {
    const mockPersons = [
      { id: '1', name: '田中太郎', birthDate: '1990-01-01' },
      { id: '2', name: '佐藤花子', birthDate: '1985-05-15' },
    ]

    // API モック
    vi.mock('@/composables/usePerson', () => ({
      usePerson: () => ({
        persons: ref(mockPersons),
        loading: ref(false),
        fetchPersons: vi.fn().mockResolvedValue(mockPersons),
      }),
    }))

    const wrapper = mount(PeoplePage, {
      global: {
        stubs: {
          NuxtPage: true,
          PersonCard: true,
        },
      },
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('田中太郎')
    expect(wrapper.text()).toContain('佐藤花子')
    expect(wrapper.findAll('[data-testid="person-card"]')).toHaveLength(2)
  })

  it('人物作成フローが正常に動作するか', async () => {
    const mockCreatePerson = vi.fn().mockResolvedValue({
      id: '3',
      name: '新規太郎',
      birthDate: '2000-01-01',
    })

    vi.mock('@/composables/usePerson', () => ({
      usePerson: () => ({
        createPerson: mockCreatePerson,
        loading: ref(false),
      }),
    }))

    const wrapper = mount(PeoplePage)

    // 新規作成フォーム表示
    await wrapper.find('[data-testid="add-person-btn"]').trigger('click')
    expect(wrapper.find('[data-testid="person-form"]').exists()).toBe(true)

    // フォーム入力
    await wrapper.find('[data-testid="name-input"]').setValue('新規太郎')
    await wrapper
      .find('[data-testid="birth-date-input"]')
      .setValue('2000-01-01')

    // 保存実行
    await wrapper.find('[data-testid="save-btn"]').trigger('click')

    expect(mockCreatePerson).toHaveBeenCalledWith({
      name: '新規太郎',
      birthDate: '2000-01-01',
    })
  })
})
```

#### フロントエンド統合テスト設計のベストプラクティス

**✅ 推奨パターン:**

```typescript
// ページ全体の動作確認に集中
it('人物詳細ページが正常に表示されるか', async () => {
  const mockPerson = { id: '1', name: '田中太郎' }

  // 必要最小限のモック
  vi.mock('@/composables/usePerson', () => ({
    usePerson: () => ({
      person: ref(mockPerson),
      loading: ref(false),
    }),
  }))

  const wrapper = mount(PersonDetailPage, {
    global: {
      mocks: { $route: { params: { id: '1' } } },
    },
  })

  // ページレベルの表示確認
  expect(wrapper.text()).toContain('田中太郎')
  expect(wrapper.find('[data-testid="person-detail"]').exists()).toBe(true)
})
```

**❌ 避けるべきパターン:**

```typescript
// コンポーネントの詳細実装に依存しすぎ
it('すべての入力フィールドのバリデーションテスト', () => {
  // これは単体テストで行うべき内容
})
```

## テスト実行スクリプト

### package.json スクリプト設定

```json
{
  "scripts": {
    "test": "vitest run",
    "test:unit": "vitest run --dir tests/unit",
    "test:integration": "vitest run --dir tests/integration",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --dir tests/unit",
    "test:setup": "docker compose --profile test up test-db -d",
    "test:teardown": "docker compose stop test-db"
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
npm run docker:test:unit
npm run docker:test:integration

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
- **全レイヤー連携**: Route → Service → Repository → DB のフロー
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

## プロジェクト全体での統一的テストフォルダ構成

### 統一フォルダ構造

プロジェクト全体でテストフォルダ構造を統一し、バックエンド・フロントエンドで一貫性を持たせます：

```
apps/
├── backend/
│   └── tests/
│       ├── unit/
│       │   ├── services/
│       │   ├── validations/
│       │   └── utils/
│       ├── integration/
│       │   └── api/
│       └── setup/
│           └── globalSetup.ts
└── frontend/
    └── tests/
        ├── unit/
        │   ├── components/
        │   ├── composables/
        │   ├── stores/
        │   └── utils/
        ├── integration/
        │   └── features/
        └── setup/
            └── setup.ts
```

### ファイル命名規則の統一

**共通命名規則:**

- テストファイル: `*.test.ts` 形式で統一
- モックファイル: `*.mock.ts` 形式（必要な場合）

### 統一化のメリット

1. **学習コストの削減**: 開発者がプロジェクト間を移動しやすい
2. **保守性の向上**: 一貫した構造で理解・メンテナンスが容易
3. **ツール設定の統一**: テスト実行スクリプトやCI/CDの設定が類似
4. **ベストプラクティスの共有**: テスト戦略が統一されて品質向上

この統一により、バックエンドとフロントエンドで同一の思想に基づいたテスト戦略を実現できます。
