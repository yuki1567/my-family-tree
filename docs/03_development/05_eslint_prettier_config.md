# ESLint・Prettier設定ガイド

## 1. 概要

### 1.1 設定方針

**コード品質の自動保証**: 手動チェックに依存せず、ツールによる自動検証とフォーマットでコード品質を担保

- **ESLint**: コードの品質とエラー検出（ルール違反の指摘）
- **Prettier**: コードの整形とスタイル統一（自動修正）
- **役割分離**: ESLintは論理的問題、Prettierは見た目の統一を担当

### 1.2 適用範囲

- **対象ファイル**: `.ts`, `.vue`, `.js` ファイル
- **実行タイミング**: ファイル保存時、コミット前、手動実行
- **統合**: IDE、Git hooks、CI/CD パイプライン

## 2. ESLint設定詳細

### 2.1 ESLint Flat Config形式について

**本プロジェクトはESLint v9以降のFlat Config形式を採用しています**

- **従来形式**: `.eslintrc.js`, `.eslintrc.json`（非推奨）
- **新形式**: `eslint.config.js`（推奨）
- **利点**:
  - TypeScript ESMモジュールとして記述可能
  - 設定の合成（複数設定の配列化）が明確
  - グローバル変数定義の柔軟性向上
  - `extends`を使わず、設定オブジェクトの配列で構成

### 2.2 ルート設定構成（eslint.config.js）

**モノレポ共通設定として、バックエンドで使用**

```javascript
// eslint.config.js
import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import prettier from 'eslint-plugin-prettier'

export const baseIgnores = [
  'node_modules',
  'dist',
  'coverage',
  'public',
  '.vscode',
  '.git',
  '**/node_modules/**',
  '**/dist/**',
  '**/coverage/**',
  '**/public/**',
  '**/.vscode/**',
  '**/.git/**',
]

export const baseConfig = [
  {
    ignores: baseIgnores,
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      globals: {
        browser: true,
        node: true,
        console: true,
        process: true,
        setTimeout: 'readonly',
        fetch: 'readonly',
        NodeJS: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      prettier,
    },
    rules: {
      // カスタムルール設定（後述）
    },
  },
  {
    files: ['scripts/**/*.{js,ts,sh}'],
    rules: {
      'no-console': 'off', // スクリプトではconsole使用許可
    },
  },
]

export default baseConfig
```

### 2.3 フロントエンド設定構成（apps/frontend/eslint.config.js）

**Nuxt.js専用設定として、`@nuxt/eslint`モジュールを使用**

```javascript
// apps/frontend/eslint.config.js
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt([
  {
    ignores: ['.nuxt/**', '.output/**'],
  },
  {
    files: ['**/*.vue'],
    rules: {
      // Vue 3では複数のルート要素が許可されているため無効化
      'vue/no-multiple-template-root': 'off',
    },
  },
])
```

**特徴**:

- **`@nuxt/eslint`**: Nuxtが推奨する設定を自動的に適用
- **`.nuxt/eslint.config.mjs`**: Nuxt起動時に自動生成される設定ファイル
- **Vue専用ルール**: `withNuxt()`が自動的にVue関連のルールを追加
- **TypeScript統合**: Nuxt環境に最適化されたTypeScriptルールを自動適用

### 2.4 追加されたルール詳細

#### **コンソール出力制御**

**`'no-console': 'warn'`**

- **目的**: 本番環境でのコンソール出力抑制
- **効果**: `console.log`使用時に警告表示
- **理由**: デバッグコードの本番混入防止

```typescript
// ⚠️ 警告が表示される
console.log('デバッグ情報')

// ✅ 本番で意図的に使う場合
// eslint-disable-next-line no-console
console.error('重要なエラー')
```

#### **TypeScript型安全性強化**

**`'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]`**

- **目的**: 未使用変数・引数の検出
- **効果**: デッドコード削減、保守性向上
- **除外**: `_`で始まる変数は意図的な未使用として許可

```typescript
// ❌ エラー: 未使用変数
const unusedVariable = 'test'

// ✅ 許可: _接頭辞で意図的な未使用を表現
const _intentionallyUnused = 'test'
function handler(_event: Event, data: string) {
  return data
}
```

**`'@typescript-eslint/no-explicit-any': 'error'`**

- **目的**: any型使用禁止による型安全性確保
- **効果**: ランタイムエラーの大幅削減
- **代替**: unknown型、具体的な型定義を推奨

```typescript
// ❌ エラー: any型使用
function process(data: any) {
  return data.name // ランタイムエラーの可能性
}

// ✅ 正解: 具体的な型定義
interface PersonData {
  name: string
}
function process(data: PersonData) {
  return data.name // 型安全
}

// ✅ 正解: unknown型使用
function process(data: unknown) {
  if (typeof data === 'object' && data !== null && 'name' in data) {
    return (data as PersonData).name
  }
}
```

**`'@typescript-eslint/prefer-nullish-coalescing': 'error'`**

- **目的**: nullish合体演算子（`??`）の使用強制
- **効果**: 空文字と未設定の適切な区別
- **重要性**: 家系図アプリでの人物データの正確な判定

```typescript
// ❌ エラー: 空文字も除外される
const displayName = person.nickname || person.firstName || 'Unknown'

// ✅ 正解: null/undefinedのみ除外
const displayName = person.nickname ?? person.firstName ?? 'Unknown'
```

**`'@typescript-eslint/prefer-optional-chain': 'error'`**

- **目的**: オプショナルチェーン（`?.`）の使用強制
- **効果**: ネストしたプロパティアクセスの安全性向上

```typescript
// ❌ エラー: 冗長な条件分岐
if (person && person.address && person.address.city) {
  console.log(person.address.city)
}

// ✅ 正解: オプショナルチェーン使用
console.log(person?.address?.city)
```

**`'@typescript-eslint/no-non-null-assertion': 'error'`**

- **目的**: 非null断言演算子（`!`）の使用禁止
- **効果**: 想定外のnull/undefinedによるエラー防止

```typescript
// ❌ エラー: 非null断言
const element = document.getElementById('app')!

// ✅ 正解: 適切なnullチェック
const element = document.getElementById('app')
if (element) {
  // 安全な処理
}
```

#### **Vue.js品質向上**

**`'vue/no-unused-components': 'error'`**

- **目的**: 未使用コンポーネントの検出
- **効果**: バンドルサイズ削減、保守性向上

**`'vue/component-definition-name-casing': ['error', 'PascalCase']`**

- **目的**: コンポーネント名のPascalCase強制
- **効果**: 命名規則の統一、HTML要素との区別

```vue
<!-- ❌ エラー: kebab-case -->
<person-card />

<!-- ✅ 正解: PascalCase -->
<PersonCard />
```

#### **一般的なコード品質**

**`'prefer-const': 'error'`**

- **目的**: 再代入されない変数のconst使用強制
- **効果**: 意図しない変更の防止、可読性向上

**`'no-var': 'error'`**

- **目的**: var宣言禁止、let/const使用強制
- **効果**: スコープの明確化、ホイスティング問題回避

**`'object-shorthand': 'error'`**

- **目的**: オブジェクトプロパティの短縮記法強制
- **効果**: コードの簡潔性向上

```typescript
// ❌ エラー: 冗長な記法
const person = {
  name: name,
  age: age,
  getName: function() { return this.name }
}

// ✅ 正解: 短縮記法
const person = {
  name,
  age,
  getName() { return this.name }
}
```

**`'prefer-destructuring': ['error', { object: true, array: false }]`**

- **目的**: オブジェクトの分割代入推奨
- **効果**: コードの可読性向上
- **制限**: 配列は対象外（インデックスアクセスが明確な場合があるため）

```typescript
// ❌ エラー: オブジェクトプロパティアクセス
const name = person.name
const age = person.age

// ✅ 正解: 分割代入
const { name, age } = person

// ✅ 許可: 配列アクセス（array: false設定により）
const firstItem = items[0]
```

## 3. Prettier設定詳細

### 3.1 基本フォーマット設定

```json
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always",
  "trailingComma": "es5",
  "endOfLine": "lf",
  "bracketSameLine": false
}
```

### 3.2 各設定項目の選択理由

#### **基本フォーマット**

**`"semi": false`**

- **理由**: セミコロンなしでコードがすっきり
- **一貫性**: プロジェクト全体で統一

**`"singleQuote": true`**

- **理由**: シングルクォートでJavaScript標準に準拠
- **効果**: HTMLとの区別、エスケープ減少

**`"printWidth": 80`**

- **理由**: 80文字で折り返し、可読性と一覧性のバランス
- **効果**: コードレビュー時の見やすさ

#### **インデント設定**

**`"tabWidth": 2`**, **`"useTabs": false`**

- **理由**: 2スペースインデントでファイルサイズ削減
- **一貫性**: JavaScript/TypeScriptコミュニティ標準

#### **スペーシング**

**`"bracketSpacing": true`**

- **理由**: `{ foo }` 形式で可読性向上
- **効果**: オブジェクト記法の見やすさ

**`"arrowParens": "always"`**

- **理由**: `(x) => x` 形式で一貫性確保
- **効果**: 型注釈追加時の変更差分最小化

#### **改行・カンマ設定**

**`"trailingComma": "es5"`**

- **理由**: オブジェクト・配列末尾にカンマ追加
- **効果**: git diff クリーン化、要素追加時の変更最小化

```typescript
// ✅ Prettierが自動フォーマット
const config = {
  api: 'https://api.example.com',
  timeout: 5000, // ← 末尾カンマ自動追加
}
```

**`"endOfLine": "lf"`**

- **理由**: Unix形式改行コードで統一
- **効果**: クロスプラットフォーム対応

**`"bracketSameLine": false`**

- **理由**: 閉じ括弧を新しい行に配置
- **効果**: ネストが深い場合の可読性向上

### 3.3 import自動並び替え設定

#### **プラグイン設定**

```json
{
  "plugins": ["@trivago/prettier-plugin-sort-imports"],
  "importOrder": [
    "^(path|fs|url|os|crypto|http|https|stream|util|events)$",
    "^[^./]",
    "^@shared/(.*)$",
    "^@/(.*)$",
    "^../(.*)$",
    "^./(.*)$"
  ],
  "importOrderSeparation": true,
  "importOrderSortSpecifiers": true
}
```

#### **並び替えルール詳細**

**`"^(path|fs|url|os|crypto|http|https|stream|util|events)$"`**: Node.js標準モジュール

- **対象**: `path`, `fs`, `url`, `os`, `crypto`, `http`, `https`, `stream`, `util`, `events`
- **理由**: Node.js標準ライブラリを最優先で配置し、外部依存と明確に区別
- **効果**: ランタイム依存関係の可視化、package.jsonの依存関係管理が容易

**`"^[^./]"`**: 外部ライブラリ

- **対象**: `hono`, `vue`, `drizzle-orm` など
- **理由**: 外部依存関係の明確化
- **効果**: package.json との整合性確認が容易

**`"^@shared/(.*)$"`**: 共有モジュール

- **対象**: `@shared/types`, `@shared/utils` など
- **理由**: モノレポ内共有コードの明示
- **効果**: アーキテクチャの可視化

**`"^@/(.*)$"`**: エイリアスパス

- **対象**: `@/services`, `@/routes` など
- **理由**: アプリケーション内部モジュールの整理
- **効果**: 深い相対パスの回避

**`"^../(.*)$"`**: 親ディレクトリ

- **対象**: `../services/PersonService`
- **理由**: 階層関係の明確化
- **効果**: ディレクトリ構造の理解促進

**`"^./(.*)$"`**: 同階層ファイル

- **対象**: `./PersonCard.vue`, `./utils`
- **理由**: 局所的依存関係の表現
- **効果**: ファイル間の関係性把握

#### **自動整形効果**

```typescript
// ❌ 整形前（混乱した順序）
import { validatePerson } from './utils/validation'
import { Hono } from 'hono'
import { PersonResponse } from '@shared/api/persons'
import fs from 'fs'
import { PersonService } from '../services/personService'

// ✅ 整形後（自動並び替え結果）
import fs from 'fs' // Node.js標準モジュール（最優先）

import { Hono } from 'hono' // 外部ライブラリ

import { PersonResponse } from '@shared/api/persons' // 共有モジュール

import { PersonService } from '../services/personService' // 親ディレクトリ

import { validatePerson } from './utils/validation' // 同階層
```

## 4. 実行方法

### 4.1 手動実行

```bash
# リント検査
docker compose exec apps npm run lint

# リント自動修正
docker compose exec apps npm run lint:fix

# フォーマット実行
docker compose exec apps npm run format

# フォーマット検査のみ
docker compose exec apps npm run format:check
```

### 4.2 IDE連携

**推奨設定**:

- ファイル保存時にPrettier自動実行
- ESLintエラーのリアルタイム表示
- import並び替えの自動実行

## 5. 運用指針

### 5.1 エラー対応

1. **ESLintエラー**: 必ず修正（自動修正推奨）
2. **Prettierフォーマット**: コミット前に必ず実行
3. **import順序**: Prettier自動整形に委ねる

### 5.2 設定変更時の手順

1. 設定ファイル更新
2. 全ファイルに設定適用: `npm run format && npm run lint:fix`
3. 本ドキュメント更新
4. チーム共有

この設定により、**型安全性の確保**、**コード品質の向上**、**開発効率の改善**を実現し、家系図アプリの安定性と保守性を大幅に向上させます。
