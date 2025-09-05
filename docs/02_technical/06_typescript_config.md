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
    ├── types/                # 型定義
    ├── constants/            # 共通定数
    └── utils/               # 共通ユーティリティ（想定）
```

### 1.2 責任分離

- **ルート**: 共通の型安全性・コーディング規約
- **フロント**: DOM、Bundler、Vue.js対応
- **バック**: Node.js、出力設定、Prisma対応
- **共有**: 型チェックのみ（当面ビルド不要、将来的にビルド対応予定）

## 2. ルートtsconfig.json設計

### 2.1 設定内容

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["./apps/shared/*"]
    }
  },
  "include": [
    "apps/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "dist",
    ".nuxt",
    "coverage"
  ]
}
```

### 2.2 各設定項目の選択理由

#### **基本設定**

**"target": "ES2022"**
- **理由**: Node.js 22.18完全サポート、フロント・バック共通使用可能
- **利点**: Top-level await、private fields等のモダン機能利用
- **影響範囲**: 全アプリ共通

**"lib": ["ES2022"]**
- **理由**: DOM関連はフロントエンド専用、共通部分のみ定義
- **除外**: DOM、DOM.Iterableはapps/frontend/tsconfig.jsonで設定
- **利点**: バックエンドでのDOM型誤用防止

#### **厳格性設定（CLAUDE.md準拠）**

**"strict": true**
- **理由**: CLAUDE.mdで「TypeScript厳格モード必須」明記
- **効果**: noImplicitAny、strictNullChecks等を一括有効化
- **プロジェクト方針**: 保守性を最優先とした設計

**"noUnusedLocals": true / "noUnusedParameters": true**
- **理由**: デッドコード検出による保守性向上
- **効果**: リファクタリング時の取り残し防止
- **運用**: _接頭辞で意図的な未使用を表現

**"exactOptionalPropertyTypes": true**
- **理由**: API型定義の厳密性確保（shared/types使用時）
- **効果**: undefined vs 未定義プロパティの明確区別
- **用途**: フロント・バック間のデータ型整合性

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
- **効果**: arr[index]が`T | undefined`型となる
- **注意**: 既存コードで多数のエラーが発生する可能性
- **対策**: 段階的導入または?.演算子活用

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

**"esModuleInterop": true / "allowSyntheticDefaultImports": true**
- **理由**: CommonJSモジュールとの互換性確保
- **効果**: import文の統一的使用
- **実用性**: Node.jsライブラリの混在環境対応

#### **パス解決設定**

**"baseUrl": "." / "paths": { "@shared/*": ["./apps/shared/*"] }**
- **理由**: モノレポ内の共有ライブラリアクセス統一
- **効果**: `import { Type } from "@shared/types"`の型解決
- **保守性**: 相対パス地獄の回避

### 2.3 除外した設定と理由

#### **フロントエンド専用設定**

**"module": "ESNext", "moduleResolution": "Bundler"**
- **除外理由**: バンドラー依存、バックエンドでは不要
- **設定場所**: apps/frontend/tsconfig.json

**"lib": ["DOM", "DOM.Iterable"]**
- **除外理由**: ブラウザ環境専用
- **設定場所**: apps/frontend/tsconfig.json

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

**"declaration": true, "declarationMap": true, "sourceMap": true**
- **除外理由**: 出力ファイル生成設定、アプリ依存
- **設定場所**: apps/backend/tsconfig.json（必要に応じて）

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

## 3. 継承設定設計

### 3.1 各アプリでの継承

```json
// apps/frontend/tsconfig.json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "noEmit": true
  }
}

// apps/backend/tsconfig.json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "Node",
    "outDir": "./dist",
    "noEmit": false,
    "declaration": true,
    "sourceMap": true
  }
}

// apps/shared/tsconfig.json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "noEmit": true
    // 将来的にビルドが必要になった場合：
    // "outDir": "./dist",
    // "declaration": true
  }
}
```

### 3.2 shared/の扱い

**apps/shared/ディレクトリの設計**
- **用途**: 型定義、共通定数、共通ユーティリティ
- **package.json**: 不要（ルートの依存関係を参照）
- **tsconfig.json**: 必要（型チェック用）
- **ビルド**: 当面不要、将来的に対応予定
- **アクセス**: `@shared/*`エイリアスで各アプリから参照

**shared/の構成例**
```
apps/shared/
├── tsconfig.json
├── types/
│   ├── request.ts
│   ├── response.ts
│   └── domain.ts
├── constants/
│   ├── api-routes.ts
│   ├── messages.ts
│   └── config.ts
└── utils/                    # 将来追加予定
    ├── validation.ts
    ├── format.ts
    └── helpers.ts
```

### 3.3 設定の優先度

1. **子tsconfig.json**: 個別設定（最高優先）
2. **親tsconfig.json**: 共通設定（ベース）
3. **TypeScriptデフォルト**: 標準設定（最低優先）

## 4. 運用指針

### 4.1 設定変更時の影響範囲

- **ルート変更**: 全アプリに影響（慎重な検討必要）
- **個別アプリ変更**: そのアプリのみに影響

### 4.2 shared/の将来的なビルド対応

**現在の設定**
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "noEmit": true
  }
}
```

**ビルド対応時の設定**
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "outDir": "./dist",
    "declaration": true,
    "declarationMap": true
  }
}
```

### 4.3 段階的厳格化

**Phase 0**: 環境構築時の設定（現在の設定）
**Phase 1**: 開発開始後、必要に応じて厳格性調整
**Phase 2**: チーム習熟度に応じた最適化

### 4.4 トラブルシューティング

**noUncheckedIndexedAccess問題**
```typescript
// エラーが出る場合
const item = array[0]; // Type: T | undefined

// 対処法
const item = array[0]!; // Non-null assertion
const item = array.at(0); // Optional chaining
if (array.length > 0) { const item = array[0]; } // Guard clause
```

**exactOptionalPropertyTypes問題**
```typescript
interface User {
  name: string;
  age?: number;
}

// エラーが出る場合
const user: User = { name: "Alice", age: undefined }; // ❌

// 正しい書き方
const user1: User = { name: "Alice" }; // ✅
const user2: User = { name: "Bob", age: 25 }; // ✅
```

**@shared/*パスの解決問題**
```typescript
// 各アプリのtsconfig.jsonでpaths設定が継承されているか確認
import { API_ROUTES } from "@shared/constants/api-routes"; // ✅

// 相対パスではなくエイリアスを使用
import { API_ROUTES } from "../../shared/constants/api-routes"; // ❌
```

---

**重要**: この設定は**保守性**を最優先に設計されています。厳格すぎる設定で開発効率が著しく低下する場合は、段階的緩和を検討してください。