# TypeScript設定設計書

## 1. 設計方針

### 1.1 階層化設定アプローチ

モノレポ対応の4層構成: ルート（共通ベース）→ フロントエンド → バックエンド → 共有ライブラリ

| 層 | 責任 |
|----|------|
| ルート | 共通の型安全性・コーディング規約 |
| フロントエンド | DOM、Bundler、Vue.js対応 |
| バックエンド | Node.js、出力設定、Drizzle ORM対応 |
| 共有 | 型チェックのみ（当面ビルド不要） |

> **実ファイル参照**: `tsconfig.json`, `apps/frontend/tsconfig.json`, `apps/backend/tsconfig.json`, `apps/shared/tsconfig.json`

## 2. ルートtsconfig.json設計

### 2.1 基本設定の選択理由

| 設定 | 値 | 理由 |
|------|-----|------|
| target | es2024 | Node.js 22.18完全サポート。Top-level await、private fields等の最新機能利用 |
| lib | es2024, DOM | SSR/SSG時のwindow参照等でDOM型が必要。バックエンドでは`typeof window !== 'undefined'`チェック必須 |
| module / moduleResolution | nodenext | Node.js 22のネイティブESMサポート対応。package.jsonの`"type": "module"`と連携 |
| esModuleInterop / allowSyntheticDefaultImports | true | CommonJSモジュールとの互換性確保 |

### 2.2 厳格性設定の選択理由

| 設定 | 理由 |
|------|------|
| strict: true | 保守性最優先。noImplicitAny、strictNullChecks等を一括有効化 |
| noUnusedLocals / noUnusedParameters | デッドコード検出。リファクタリング時の取り残し防止。_接頭辞で意図的未使用を表現 |
| exactOptionalPropertyTypes: false | Drizzle ORM推論型との互換性確保。trueの場合`{ field?: T \| undefined }`と`{ field?: T }`の区別が厳密になり実用上問題が発生 |
| noImplicitReturns | 関数の戻り値漏れ防止。全コードパスでの戻り値保証 |
| noFallthroughCasesInSwitch | switch文でのbreak忘れ防止 |
| noUncheckedIndexedAccess | 配列・オブジェクトアクセスの安全性向上。`arr[index]`が`T \| undefined`型に |
| noImplicitOverride | クラス継承時のoverrideキーワード強制 |
| noPropertyAccessFromIndexSignature | 動的プロパティアクセス時の型安全性 |

### 2.3 品質保証設定の選択理由

| 設定 | 理由 |
|------|------|
| allowUnusedLabels: false / allowUnreachableCode: false | 到達不可能コード・不要ラベルの検出 |
| skipLibCheck: true | 外部ライブラリの型チェック無効化によるビルド時間短縮。リスクは軽微 |
| forceConsistentCasingInFileNames | macOS→Linux移行安全性（大文字小文字区別差異） |
| sourceMap: true | デバッグ効率化。エラースタックトレースでTypeScriptファイル位置を表示 |

### 2.4 パス解決設定の設計理由

| パス | 理由 |
|------|------|
| @shared/* | モノレポ内の共有ライブラリアクセス統一。深い相対パス（`../../../`）の回避 |
| @/* | バックエンド内での相対パス回避（apps/backend/tsconfig.jsonで設定） |

## 3. 除外した設定と理由

### 3.1 フロントエンド専用（ルートに含めない理由）

| 設定 | 除外理由 | 設定場所 |
|------|---------|---------|
| module: ESNext / moduleResolution: Bundler | Vite/Nuxtバンドラー環境専用 | apps/frontend/tsconfig.json |
| allowImportingTsExtensions | バンドラー依存機能 | apps/frontend/tsconfig.json |
| isolatedModules | バンドラー最適化用 | apps/frontend/tsconfig.json |

### 3.2 出力設定（アプリごとに異なる理由）

| 設定 | 理由 |
|------|------|
| noEmit | フロント（true: Viteがビルド担当）、バック（false: tscが出力）、共有（true）で異なる |
| declaration / declarationMap | バックエンド専用の型定義ファイル生成 |

### 3.3 使用しない機能と理由

| 設定 | 除外理由 |
|------|---------|
| jsx: preserve | Vue.js使用、JSX不使用 |
| resolveJsonModule | JSON import不使用。設定ファイルは.ts形式で管理 |
| verbatimModuleSyntax | Vue.jsとの互換性問題回避 |

## 4. 共有ライブラリ設定

- **用途**: 型定義、共通定数、共通ユーティリティ
- **ビルド**: 当面不要、将来的に対応予定
- **アクセス**: `@shared/*`エイリアスで各アプリから参照
