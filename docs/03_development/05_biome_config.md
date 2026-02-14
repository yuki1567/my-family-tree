# Biome設定ガイド

## 1. 概要

### 1.1 設定方針

**コード品質の自動保証**: 手動チェックに依存せず、ツールによる自動検証とフォーマットでコード品質を担保

- **Biome**: リンティング・フォーマット・import整理を単一ツールで統合
- **利点**: ESLint + Prettierの2ツール構成を1ツールに統合し、設定の簡素化と実行速度の大幅改善を実現

### 1.2 適用範囲

- **対象ファイル**: `.ts`, `.js`, `.mjs`, `.cjs`, `.vue`, `.json`, `.css`
- **除外対象**: `node_modules`, `dist`, `.nuxt`, `.output`, `coverage`, `public`, `.vscode`, `.git`, `database/migrations`, `package-lock.json`, ログファイル
- **実行タイミング**: ファイル保存時、手動実行、CI/CDパイプライン

## 2. 設定構成

### 2.1 統一設定ファイル（biome.json）

**モノレポルートに配置し、全パッケージで共有**

Biome 2.x系のスキーマを使用しています。

```json
{
  "$schema": "https://biomejs.dev/schemas/2.3.15/schema.json",
  "files": {
    "includes": [
      "**/*.ts", "**/*.js", "**/*.mjs", "**/*.cjs",
      "**/*.vue", "**/*.json", "**/*.css",
      "!node_modules", "!dist", "!**/.nuxt", "!**/.output",
      "!coverage", "!public", "!.vscode", "!.git",
      "!**/database/migrations", "!package-lock.json",
      "!*.log", "!logs"
    ]
  }
}
```

**特徴**:

- **単一ファイル**: ルート`biome.json`1つでモノレポ全体をカバー
- **includesベース**: 対象ファイルパターンと`!`プレフィックスによる除外を一元管理
- **overrides**: ファイルパターンごとにルールを上書き可能

## 3. フォーマッター設定

### 3.1 基本フォーマット設定

```json
{
  "formatter": {
    "indentStyle": "space"
  },
  "javascript": {
    "formatter": {
      "semicolons": "asNeeded",
      "quoteStyle": "single",
      "trailingCommas": "es5"
    }
  }
}
```

デフォルト値と異なる設定のみ記述しています。

### 3.2 各設定項目の選択理由

| 設定 | 値 | デフォルト | 理由 |
|------|-----|-----------|------|
| `indentStyle` | `space` | `tab` | JavaScript/TypeScriptコミュニティ標準 |
| `semicolons` | `asNeeded` | `always` | セミコロンなしでコードがすっきり |
| `quoteStyle` | `single` | `double` | シングルクォートでJS標準に準拠 |
| `trailingCommas` | `es5` | `all` | git diff クリーン化 |

## 4. リンタールール詳細

### 4.1 有効なルール

#### コンソール出力制御

**`noConsole: "warn"`**

- **目的**: 本番環境でのコンソール出力抑制
- **効果**: `console.log`使用時に警告表示
- **抑制方法**: 意図的な使用箇所では`biome-ignore`コメントを使用

```typescript
// ⚠️ 警告が表示される
console.log('デバッグ情報')

// ✅ 本番で意図的に使う場合
// biome-ignore lint/suspicious/noConsole: エラーログ出力は本番機能として必要
console.error('重要なエラー')
```

#### TypeScript型安全性強化

**`noExplicitAny: "error"`**

- **目的**: any型使用禁止による型安全性確保
- **効果**: ランタイムエラーの大幅削減
- **代替**: unknown型、具体的な型定義を推奨

```typescript
// ❌ エラー: any型使用
function process(data: any) {
  return data.name
}

// ✅ 正解: 具体的な型定義
interface PersonData {
  name: string
}
function process(data: PersonData) {
  return data.name
}
```

**`noUnusedVariables: "error"` / `noUnusedImports: "error"`**

- **目的**: 未使用変数・インポートの検出
- **効果**: デッドコード削減、保守性向上

**`noNonNullAssertion: "error"`**

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

#### コード品質

**`useConst: "error"`**

- **目的**: 再代入されない変数のconst使用強制
- **効果**: 意図しない変更の防止

**`useOptionalChain: "error"`**

- **目的**: オプショナルチェーン（`?.`）の使用強制
- **効果**: ネストしたプロパティアクセスの安全性向上

```typescript
// ❌ エラー: 冗長な条件分岐
if (person && person.address && person.address.city) {}

// ✅ 正解: オプショナルチェーン使用
person?.address?.city
```

**`useShorthandAssign: "error"`**

- **目的**: 短縮代入演算子の使用強制
- **効果**: コードの簡潔性向上

### 4.2 overrides設定

#### スクリプトファイル

```json
{
  "includes": ["scripts/**"],
  "linter": {
    "rules": {
      "suspicious": { "noConsole": "off" }
    }
  }
}
```

- **理由**: CLIスクリプトではconsole出力が正当な用途

#### Vueファイル

```json
{
  "includes": ["**/*.vue"],
  "linter": {
    "rules": {
      "correctness": {
        "noUnusedVariables": "off",
        "noUnusedImports": "off"
      }
    }
  }
}
```

- **理由**: BiomeはVue SFCの`<template>`を解析しないため、`<script>`で定義してテンプレートで使用する変数・コンポーネントを「未使用」と誤検出する

#### テストファイル

```json
{
  "includes": ["**/tests/**"],
  "linter": {
    "rules": {
      "suspicious": { "noConsole": "off" }
    }
  }
}
```

- **理由**: テストのセットアップ・デバッグでconsole出力は正当な用途

## 5. import自動整理

### 5.1 設定

```json
{
  "assist": {
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  }
}
```

### 5.2 効果

Biomeが自動的にimport文を整理・並び替えします。

## 6. biome-ignoreコメント

### 6.1 書式

```typescript
// biome-ignore lint/ルールカテゴリ/ルール名: 理由
```

### 6.2 使用例

```typescript
// biome-ignore lint/suspicious/noExplicitAny: vi.spyOnの戻り値型を柔軟に扱うため
let consoleErrorSpy: any

// biome-ignore lint/style/noNonNullAssertion: テストデータで明示的にresponseを定義済み
error.response!.error

// biome-ignore lint/suspicious/noConsole: エラーログ出力は本番機能として必要
console.error('Error details:', error)
```

**注意**: `biome-ignore`は次の1行にのみ適用されます。ブロック全体を抑制する場合は各行に個別にコメントが必要です。

## 7. 実行方法

### 7.1 手動実行

```bash
# 一括チェック（リント + フォーマット + import整理）
docker compose exec apps npm run check

# 一括自動修正
docker compose exec apps npm run check:fix

# ワークスペース個別の品質チェック（type-check + check + test:unit）
docker compose exec apps npm run quality --workspace=apps/frontend
docker compose exec apps npm run quality --workspace=apps/backend
```

### 7.2 IDE連携

**VSCode推奨設定**:

- Biome公式拡張機能をインストール
- ファイル保存時にBiome自動実行を設定
- リンティングエラーのリアルタイム表示

## 8. 運用指針

### 8.1 エラー対応

1. **一括修正（推奨）**: `npm run check:fix`でリント・フォーマット・import整理を一括自動修正
2. **コミット前**: `npm run check`で問題がないか確認

### 8.2 設定変更時の手順

1. `biome.json`更新
2. 全ファイルに設定適用: `docker compose exec apps npm run check:fix`
3. 本ドキュメント更新
4. チーム共有

この設定により、**型安全性の確保**、**コード品質の向上**、**開発効率の改善**を単一ツールで実現し、家系図アプリの安定性と保守性を大幅に向上させます。
