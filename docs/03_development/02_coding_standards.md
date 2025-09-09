# コーディング規約

## 1. 基本原則

### 1.1 共通原則

- **可読性優先**: コードは書く時間より読む時間の方が長い
- **一貫性**: プロジェクト全体で統一されたスタイル
- **シンプルさ**: 複雑さを避け、明確で理解しやすいコード
- **型安全性**: TypeScript strict mode を活用した堅牢なコード

### 1.2 技術制約

- **TypeScript 必須**: 全ファイルで TypeScript 使用
- **strict mode**: TypeScript strict mode 有効
- **ESLint + Prettier**: 自動フォーマット・リント必須
- **フレームワークレス**: TailwindCSS、UI ライブラリ使用禁止

### 1.3 プログラミングパラダイム

- **サーバーサイド**: オブジェクト指向と関数型プログラミングを組み合わせて使用
- **フロントエンド**: 関数型プログラミングを使用

## 2. TypeScript 規約

### 2.1 基本ルール

- **厳格な型チェック**: `strict: true`を使用
- **any 型禁止**: やむを得ない場合は`unknown`を使用
- **type 推奨**: 型定義は`interface`より`type`を推奨
- **enum 使用禁止**: Union Types を使用する
- **明示的な戻り値型**: 関数の戻り値型を明記
- **null 安全**: nullable な値には適切なガード句を実装

### 2.2 型定義

```typescript
// ✅ 良い例 - type使用推奨
type Person = {
  readonly id: string
  name?: string
  gender?: Gender
  birthDate?: Date
  deathDate?: Date
  readonly createdAt: Date
  readonly updatedAt: Date
}

type Gender = 'male' | 'female' // enumの代わりにUnion Types
type RelationshipType = 'biological' | 'adopted'

// ユーティリティ型の活用
type CreatePersonData = Omit<Person, 'id' | 'createdAt' | 'updatedAt'>
type UpdatePersonData = Partial<CreatePersonData>

// ❌ 悪い例
interface Person {
  // interfaceよりtypeを推奨
  id: any // any型使用
  name: string // オプション性の考慮不足
  data: object // 曖昧な型
}

enum Gender {
  // enum使用禁止
  MALE = 'male',
  FEMALE = 'female',
}
```

### 2.3 関数定義

#### フロントエンド（アロー関数推奨）
コンポーネント内の状態やユーティリティ関数を中心に構成され、再利用性が重要なためボトムアップ型のアロー関数を採用

```typescript
// ✅ 良い例（フロントエンド）
const formatDate = (date: Date | string): string => {
  const d = new Date(date)
  return d.getFullYear().toString()
}

const calculateAge = (birthDate: Date): number => {
  const today = new Date()
  return today.getFullYear() - birthDate.getFullYear()
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
```

#### バックエンド設計の使い分け

**クラスベース設計**：「状態管理」「ビジネスロジック」を表現する層
- **対象層**: `controllers/`, `services/`, `repositories/`
- **理由**: 依存性注入、状態管理、継承を活用したオブジェクト指向設計を採用

**アロー関数**：「純粋関数」「小さい再利用関数」が多い層
- **対象層**: `middlewares/`, `validations/`, `utils/`, `config/`
- **理由**: 純粋関数や小さな再利用可能な関数を中心に構成され、関数型プログラミングのスタイルを採用

```typescript
// ✅ 良い例（クラスベース設計：controllers/, services/, repositories/）
export class PersonController {
  constructor(private personService: PersonService) {}

  async create(req: Request, res: Response): Promise<void> {
    const validatedData = req.body as CreatePersonRequest
    const result = await this.personService.create(validatedData)
    
    res.status(201).json({
      isSuccess: true,
      data: result,
    })
  }
}

export class PersonService {
  constructor(private personRepository: PersonRepository) {}

  async create(data: CreatePersonRequest) {
    return await this.personRepository.create(data)
  }
}

export class PersonRepository {
  async create(data: CreatePersonRequest) {
    // データベース操作
    return result
  }
}

// ✅ 良い例（アロー関数：middlewares/, validations/, utils/, config/）
const validateBody = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body = schema.parse(req.body)
    next()
  } catch (error) {
    next(error)
  }
}

const formatErrorMessage = (error: ZodError): string => {
  return error.errors.map(e => e.message).join(', ')
}

const isValidId = (id: string): boolean => {
  return /^[0-9a-fA-F-]{36}$/.test(id)
}

// ❌ 悪い例
function calculateAge(birthDate) {
  // 型注釈なし
  return new Date().getFullYear() - new Date(birthDate).getFullYear()
}
```

### 2.4 エラーハンドリング

```typescript
// ✅ 良い例
async function fetchPerson(id: string): Promise<Person | null> {
  try {
    const response = await fetch(`/api/people/${id}`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch person:', error)
    return null
  }
}

// ❌ 悪い例
async function fetchPerson(id) {
  const response = await fetch(`/api/people/${id}`)
  return response.json() // エラーハンドリングなし
}
```

## 3. Vue.js 規約

### 3.1 コンポーネント構造

```vue
<template>
  <!-- HTMLテンプレート -->
</template>

<script setup lang="ts">
// 1. インポート
import { ref, computed, watch } from 'vue'
import type { Person } from '~/types/person'

// 2. Props・Emits定義
type Props = {
  person: Person
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
})

type Emits = {
  save: [person: Person]
  cancel: []
}

const emit = defineEmits<Emits>()

// 3. リアクティブデータ
const isLoading = ref(false)
const formData = ref<CreatePersonData>({})

// 4. 算出プロパティ
const isValid = computed(() => {
  return formData.value.name && formData.value.name.length > 0
})

// 5. ウォッチャー
watch(
  () => props.person,
  (newPerson) => {
    if (newPerson) {
      formData.value = { ...newPerson }
    }
  },
  { immediate: true },
)

// 6. メソッド
const handleSave = async (): Promise<void> => {
  if (!isValid.value) return

  isLoading.value = true
  try {
    emit('save', formData.value as Person)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* コンポーネント固有のスタイル */
</style>
```

### 3.2 コンポーネント命名

```typescript
// ✅ 良い例 - PascalCase
PersonModal.vue → PersonModal
FamilyTreeCanvas.vue → FamilyTreeCanvas
BaseButton.vue → BaseButton

// ❌ 悪い例
person-modal.vue  // kebab-case
personModal.vue  // camelCase
```

### 3.3 Props・Events 定義

```typescript
// ✅ 良い例
type Props = {
  person: Person
  isLoading?: boolean
  readonly?: boolean
}

type Emits = {
  save: [person: Person]
  cancel: []
  update: [field: string, value: string]
}

// ❌ 悪い例
const props = defineProps(['person', 'isLoading']) // 型なし
const emit = defineEmits(['save', 'cancel']) // 型なし
```

### 3.4 テンプレート記述

```vue
<!-- ✅ 良い例 -->
<template>
  <div class="person-modal">
    <h2 class="modal-title">
      {{ isEditing ? '人物を編集' : '新しい人物' }}
    </h2>

    <form @submit.prevent="handleSubmit">
      <input
        v-model="formData.name"
        type="text"
        placeholder="氏名を入力"
        :disabled="readonly"
        data-testid="person-name"
      />
    </form>
  </div>
</template>

<!-- ❌ 悪い例 -->
<template>
  <div class="personModal">
    <!-- kebab-caseでない -->
    <h2>{{ title }}</h2>
    <input v-model="name" />
    <!-- 型安全性なし -->
  </div>
</template>
```

## 4. 命名規則

### 4.1 ファイル・ディレクトリ

```
# ✅ 良い例
components/
├── atoms/
│   ├── AppButton.vue
│   └── LoadingSpinner.vue
├── molecules/
│   └── FormField.vue
└── organisms/
    ├── PersonModal.vue
    └── FamilyTreeCanvas.vue

stores/
├── person.ts
└── relationship.ts

# ❌ 悪い例
Components/  # PascalCase
person_store.ts  # snake_case
PersonStore.ts  # PascalCase
```

### 4.2 変数・関数

```typescript
// ✅ 良い例 - camelCase
const userName = 'John'
const calculateAge = (birthDate: Date) => {}
const isValidEmail = (email: string) => {}

// 定数 - UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3
const API_BASE_URL = 'https://api.example.com'

// ❌ 悪い例
const user_name = 'John' // snake_case
const UserName = 'John' // PascalCase
const Calculate_Age = () => {} // 混在
```

### 4.3 型・インターフェース・クラス

```typescript
// ✅ 良い例 - PascalCase
type PersonData = {}
type RelationshipType = 'biological' | 'adopted' // Union Types使用
class FamilyTreeService {}

// ❌ 悪い例
interface personData {} // camelCase
type relationship_type = string // snake_case
class familyTreeService {} // camelCase
enum Gender {
  MALE,
  FEMALE,
} // enum使用禁止
```

### 4.4 CSS クラス

```css
/* ✅ 良い例 - kebab-case */
.person-modal {
}
.modal-header {
}
.form-field {
}
.loading-spinner {
}

/* 状態クラス */
.selected {
}
.highlighted {
}
.male {
}
.female {
}

/* ❌ 悪い例 */
.personModal {
} /* camelCase */
.person_modal {
} /* snake_case */
.PersonModal {
} /* PascalCase */
```

## 5. コード構成・組織化

### 5.1 インポート順序

```typescript
// ✅ 良い例
// 1. Node.js標準ライブラリ
import { readFile } from 'fs/promises'

// 2. 外部ライブラリ
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// 3. 内部モジュール（shared）
import type { Person } from '~/shared/types/person'
import { API_ROUTES } from '~/shared/constants/api-routes'

// 4. 相対インポート
import PersonCard from './PersonCard.vue'
import { validatePerson } from '../utils/validation'
```

## 6. コメント・ドキュメント

### 6.1 基本原則

**「コードを読めばわかる内容はコメントしない」**

- コメントはコードでは表現できない「なぜ」「背景」「意図」を説明する
- 「何を」「どのように」はコードそのもので表現する
- 不要なコメントはコードの可読性を損なう

### 6.2 TSDoc コメント

```typescript
// ✅ 良い例 - 公開API、複雑なロジックの背景
/**
 * 人物の年齢を計算する
 * @param birthDate 生年月日
 * @returns 年齢（歳）
 */
export function calculateAge(birthDate: Date): number {
  const today = new Date()
  return today.getFullYear() - birthDate.getFullYear()
}

// ビジネスルールの背景説明
const layoutedPeople = computed(() => {
  // 世代別分類が必要な理由：座標計算アルゴリズムの前提条件
  const generations = classifyByGeneration(people.value, relationships.value)
  return calculatePositions(generations)
})
```

### 6.3 避けるべきコメント

```typescript
// ❌ 悪い例 - コードから明らかな内容
function calculateAge(birthDate: Date): number {
  // 今日の日付を取得
  const today = new Date()
  // 年齢を計算
  return today.getFullYear() - birthDate.getFullYear()
}

// ❌ 悪い例 - 曖昧で行動を起こせない
// TODO: 後で修正
// FIXME: バグあり

// ❌ 悪い例 - テストのArrange/Act/Assert
it('有効なデータの場合、人物を作成できるか', async () => {
  // Arrange
  const mockRepository = createMockRepository()
  // Act  
  const result = await service.create(data)
  // Assert
  expect(result).toBeDefined()
})
```

### 6.4 推奨するコメント

```typescript
// ✅ 良い例 - ビジネスルールの説明
const isValidDateRange = (birth: string, death?: string) => {
  // ビジネスルール：死亡日は誕生日以降でなければならない
  if (death && birth > death) {
    throw new Error('DEATH_BEFORE_BIRTH')
  }
}

// ✅ 良い例 - 技術的制約の説明
const optimizedQuery = useMemo(() => {
  // パフォーマンス要件：1000件以上の場合は仮想化が必要
  return people.length > 1000 ? virtualizedQuery : standardQuery
}, [people.length])

// ✅ 良い例 - 外部要因の説明
const handleApiError = (error: ApiError) => {
  // 外部APIの仕様：429エラー時は指数バックオフで再試行
  if (error.status === 429) {
    return retryWithBackoff(error.retryAfter)
  }
}
```
