# TypeScript設定設計書

## 1. 設計方針

### 1.1 階層化設定アプローチ

**モノレポ対応の4層構成**

```
family-tree-app/
├── tsconfig.json              # 共通設定（ベース）
├── apps/frontend/tsconfig.json # フロントエンド専用設定
├── apps/backend/tsconfig.json  # バックエンド専用設定
└── apps/shared/tsconfig.json   # 共有ライブラリ用設定
```

### 1.2 責任分離

- **ルート**: 共通の型安全性・コーディング規約
- **フロント**: DOM、Bundler、Vue.js対応
- **バック**: Node.js、出力設定、Drizzle ORM対応
- **共有**: 型チェックのみ（当面ビルド不要、将来的にビルド対応予定）

## 2. ルートtsconfig.json設計

### 2.1 各設定項目の選択理由

#### **基本設定**

**"target": "es2024"**

- **理由**: Node.js 22.18完全サポート、最新のECMAScript機能を利用可能
- **利点**: Top-level await、private fields、Decorators等の最新機能利用
- **影響範囲**: 全アプリ共通
- **ES2024新機能**: Object grouping、Promise.withResolvers等

**"lib": ["es2024", "DOM"]**

- **理由**: ES2024標準ライブラリ + DOM型を共通設定に含める
- **DOM含有理由**: Nuxt.js環境ではフロントエンド・バックエンド両方でDOM型が必要となる場合があるため（SSR/SSG時のwindow参照等）
- **注意**: バックエンドでDOM型を使用する場合は、実行環境チェック（`typeof window !== 'undefined'`）を必ず実施

#### **厳格性設定**

**"strict": true**

- **理由**: 保守性を最優先するため
- **効果**: noImplicitAny、strictNullChecks等を一括有効化

**"noUnusedLocals": true / "noUnusedParameters": true**

- **理由**: デッドコード検出による保守性向上
- **効果**: リファクタリング時の取り残し防止
- **運用**: \_接頭辞で意図的な未使用を表現

**"exactOptionalPropertyTypes": false**

- **設定理由**: Drizzle ORM推論型との互換性確保のため無効化
- **背景**: exactOptionalPropertyTypes: trueの場合、Drizzle ORM推論型で`{ field?: T | undefined }`と`{ field?: T }`の区別が厳密になり、実用上の問題が発生
- **トレードオフ**: 型安全性は若干低下するが、実装の柔軟性とライブラリ互換性を優先
- **代替策**: optional chainning（`?.`）やnullish coalescing（`??`）で明示的なundefinedハンドリングを実施

**"noImplicitReturns": true**

- **理由**: 関数の戻り値漏れ防止
- **効果**: 全コードパスでの戻り値保証
- **保守性**: 条件分岐の抜け漏れ検出

**"noFallthroughCasesInSwitch": true**

- **理由**: switch文でのbreak忘れ防止
- **効果**: 意図しないフォールスルー検出
- **実用性**: 列挙型使用時のバグ防止

**"noUncheckedIndexedAccess": true**

- **理由**: 配列・オブジェクトアクセスの安全性向上
- **効果**: `arr[index]`が`T | undefined`型となる
- **注意**: ?.演算子での安全なアクセス必要

**"noImplicitOverride": true**

- **理由**: クラス継承時のメソッドオーバーライド明示化
- **効果**: overrideキーワード強制
- **用途**: オブジェクト指向設計での型安全性

**"noPropertyAccessFromIndexSignature": true**

- **理由**: オブジェクトプロパティアクセスの厳密化
- **効果**: obj.prop vs obj["prop"]の使い分け強制
- **実用性**: 動的プロパティアクセス時の型安全性

#### **品質保証設定**

**"allowUnusedLabels": false / "allowUnreachableCode": false**

- **理由**: 到達不可能コード・不要ラベルの検出
- **効果**: コード品質の底上げ
- **保守性**: 意図しない条件分岐の検出

**"skipLibCheck": true**

- **理由**: 外部ライブラリの型チェック無効化による高速化
- **効果**: ビルド時間短縮
- **リスク**: 外部ライブラリの型エラー見逃し（影響軽微）

**"forceConsistentCasingInFileNames": true**

- **理由**: ファイル名の大文字・小文字統一強制
- **効果**: クロスプラットフォーム対応
- **実用性**: macOS（大文字小文字区別なし）→Linux（区別あり）の移行安全性

#### **モジュールシステム設定**

**"module": "nodenext" / "moduleResolution": "nodenext"**

- **理由**: Node.js 22のネイティブESMサポートに対応
- **効果**: package.jsonの"type": "module"設定と連携し、純粋なESMプロジェクトとして動作
- **利点**:
  - `.js`拡張子で明示的なimport（`import { foo } from './bar.js'`）
  - 条件付きエクスポート（package.json "exports"フィールド）の完全サポート
  - Node.jsランタイムとの完全な一貫性
- **注意**: CommonJSとの混在環境では、相互運用性に注意が必要

**"esModuleInterop": true / "allowSyntheticDefaultImports": true**

- **理由**: CommonJSモジュールとの互換性確保
- **効果**: import文の統一的使用（`import hono from 'hono'`形式）
- **実用性**: Node.jsライブラリの混在環境対応

#### **パス解決設定**

**"baseUrl": "." / "paths"設定**

```json
{
  "paths": {
    "@shared/*": ["./apps/shared/*"],
    "@/*": ["./apps/backend/*"] // バックエンド専用
  }
}
```

- **@shared/\***: モノレポ内の共有ライブラリアクセス統一
- **@/\***: バックエンド内での相対パス回避（apps/backend/tsconfig.json で設定）
- **効果**: `import { Type } from "@shared/types"`, `import { service } from "@/services/person"`
- **保守性**: 深い相対パス（`../../../`）の回避

#### **デバッグ設定**

**"sourceMap": true**

- **理由**: デバッグ効率化のため、全環境でソースマップを生成
- **効果**: TypeScriptソースコードと出力JavaScriptの対応付けが可能
- **利点**:
  - エラースタックトレースが元のTypeScriptファイル位置を表示
  - ブラウザDevToolsでTypeScriptコードを直接デバッグ可能
  - Node.jsデバッガーでのステップ実行が容易
- **注意**: 本番環境では`.map`ファイルを除外することでセキュリティ向上可能

### 2.3 除外した設定と理由

#### **フロントエンド専用設定**

**"module": "ESNext", "moduleResolution": "Bundler"**

- **除外理由**: ルート設定では`module: "nodenext"`を採用（Node.js環境に最適化）
- **設定場所**: apps/frontend/tsconfig.json（Nuxtバンドラー環境に応じて設定）
- **補足**: フロントエンドではVite/Nuxtバンドラーが`moduleResolution: "Bundler"`を適切に処理

**"allowImportingTsExtensions": true**

- **除外理由**: バンドラー依存機能
- **設定場所**: apps/frontend/tsconfig.json

**"isolatedModules": true**

- **除外理由**: バンドラー最適化用
- **設定場所**: apps/frontend/tsconfig.json

#### **出力設定**

**"noEmit": true/false**

- **除外理由**: フロント（true）・バック（false）・共有（true）で異なる
- **設定場所**: 各アプリのtsconfig.json
- **補足**: フロントエンドはViteがビルドを担当、バックエンドはTypeScriptコンパイラが出力

**"declaration": true, "declarationMap": true**

- **除外理由**: 型定義ファイル生成設定、バックエンド専用
- **設定場所**: apps/backend/tsconfig.json（必要に応じて）
- **補足**: `sourceMap`はルート設定に含まれるが、declaration系はバックエンドのみで使用

#### **使用しない機能**

**"jsx": "preserve"**

- **除外理由**: Vue.js使用、JSX不使用
- **代替**: Vue SFC（Single File Component）使用

**"resolveJsonModule": true**

- **除外理由**: JSON import不使用
- **方針**: 設定ファイルは.ts形式で管理

**"verbatimModuleSyntax": true**

- **除外理由**: Vue.jsとの互換性問題回避
- **リスク**: import type使用時の問題発生可能性

## 3. 共有ライブラリ設定

### 3.1 apps/shared/ディレクトリ設計

**基本方針**:

- **用途**: 型定義、共通定数、共通ユーティリティ
- **package.json**: 不要（ルートの依存関係を参照）
- **tsconfig.json**: 必要（型チェック専用）
- **ビルド**: 当面不要、将来的に対応予定
- **アクセス**: `@shared/*`エイリアスで各アプリから参照
