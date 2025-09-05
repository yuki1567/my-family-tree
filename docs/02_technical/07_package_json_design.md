# Package.json設計書

## 1. 設計方針

### 1.1 モノレポ構成でのpackage.json役割分担

```
family-tree-app/
├── package.json              # ワークスペース管理・共通ツール
├── apps/frontend/package.json # Nuxt.js v3 + TypeScript環境
├── apps/backend/package.json  # Express + Prisma + TypeScript環境
└── apps/shared/              # package.json不要（ルート依存関係参照）
```

### 1.2 依存関係管理戦略

**ホイスティング活用**
- 共通依存関係はルートで一元管理
- 各アプリ固有の依存関係のみ個別管理
- バージョン固定によるビルド再現性確保

## 2. ルートpackage.json設計

### 2.1 設定内容

```json
{
  "name": "family-tree-app",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "workspaces": [
    "apps/frontend",
    "apps/backend",
    "apps/shared"
  ],
  "scripts": {
    "dev": "npm run dev:backend & npm run dev:frontend",
    "dev:frontend": "npm run dev --workspace=apps/frontend",
    "dev:backend": "npm run dev --workspace=apps/backend",
    "build": "npm run build:shared && npm run build:backend && npm run build:frontend",
    "type-check": "npm run type-check --workspace=apps/frontend & npm run type-check --workspace=apps/backend & npm run type-check --workspace=apps/shared",
    "lint": "npm run lint --workspace=apps/frontend & npm run lint --workspace=apps/backend & npm run lint --workspace=apps/shared",
    "format": "prettier --write \"**/*.{js,ts,vue,json,md}\"",
    "test": "npm run test --workspace=apps/frontend & npm run test --workspace=apps/backend",
    "clean": "rm -rf node_modules apps/*/node_modules apps/*/dist apps/*/.nuxt",
    "db:migrate": "npm run db:migrate --workspace=apps/backend",
    "db:seed": "npm run db:seed --workspace=apps/backend",
    "db:studio": "npm run db:studio --workspace=apps/backend"
  },
  "devDependencies": {
    "@types/node": "24.2.1",
    "@typescript-eslint/eslint-plugin": "8.39.1",
    "@typescript-eslint/parser": "8.39.1",
    "eslint": "9.33.0",
    "eslint-config-prettier": "10.1.8",
    "eslint-plugin-prettier": "5.5.4",
    "prettier": "3.6.2",
    "typescript": "5.9.2"
  }
}
```

### 2.2 各項目の設計理由

#### **基本設定**

**"name": "family-tree-app"**
- **理由**: プロジェクトルート識別用
- **方針**: 公開予定なし（private: true）

**"type": "module"**
- **理由**: ESModules統一使用
- **効果**: import/export構文の一貫性
- **技術的根拠**: Node.js 22.18でESModules完全サポート

**"workspaces": ["apps/frontend", "apps/backend", "apps/shared"]**
- **理由**: モノレポ依存関係管理の効率化
- **効果**: 
  - ホイスティング（重複排除）
  - 統一されたnode_modules管理
  - 相互参照の簡易化
- **shared含有理由**: 型定義ファイルのパス解決統一

#### **スクリプト設計**

**並列実行戦略（&使用）**
```json
"dev": "npm run dev:backend & npm run dev:frontend",
"type-check": "npm run type-check --workspace=apps/frontend & ..."
```
- **理由**: 開発効率の最大化
- **技術的利点**: 
  - フロント・バック同時起動
  - 型チェック並列実行による高速化
  - CI/CD環境での並列ジョブ活用

**ワークスペーススクリプトパターン**
```json
"dev:frontend": "npm run dev --workspace=apps/frontend"
```
- **理由**: 個別アプリの独立実行可能性
- **保守性**: 各アプリのpackage.jsonに実装詳細を委譲
- **運用性**: デバッグ時の個別起動対応

**ビルド順序制御**
```json
"build": "npm run build:shared && npm run build:backend && npm run build:frontend"
```
- **理由**: 依存関係に基づく順次実行
- **順序の根拠**:
  1. shared: 型定義（将来のビルド対応時）
  2. backend: APIサーバー
  3. frontend: APIに依存するクライアント

#### **共通開発依存関係**

**TypeScript関連**
```json
"typescript": "5.9.2",
"@types/node": "24.2.1"
```
- **バージョン固定理由**: 全アプリでの型互換性保証
- **Node.js型定義**: 共通実行環境のため

**ESLint設定**
```json
"eslint": "9.33.0",
"@typescript-eslint/eslint-plugin": "8.39.1",
"@typescript-eslint/parser": "8.39.1",
"eslint-config-prettier": "10.1.8",
"eslint-plugin-prettier": "5.5.4"
```
- **統一Lint設定**: 全アプリでのコード品質統一
- **TypeScript対応**: 厳格モード要件への対応
- **Prettier統合**: フォーマット自動化

**Prettier設定**
```json
"prettier": "3.6.2"
```
- **理由**: コードフォーマット統一
- **対象ファイル**: `"**/*.{js,ts,vue,json,md}"`
- **効果**: コードレビュー効率化

## 3. フロントエンドpackage.json設計

### 3.1 設定内容

```json
{
  "name": "@family-tree-app/frontend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare",
    "type-check": "vue-tsc --noEmit",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  },
  "dependencies": {
    "nuxt": "3.13.2",
    "vue": "3.5.10",
    "@nuxt/eslint": "0.5.7",
    "@pinia/nuxt": "0.5.5",
    "pinia": "2.2.4"
  },
  "devDependencies": {
    "@nuxt/test-utils": "3.14.3",
    "@vue/test-utils": "2.4.6",
    "vue-tsc": "2.1.6",
    "vitest": "2.1.2",
    "@vitest/ui": "2.1.2",
    "@vitest/coverage-v8": "2.1.2",
    "happy-dom": "15.7.4"
  }
}
```

### 3.2 各項目の設計理由

#### **基本設定**

**"name": "@family-tree-app/frontend"**
- **理由**: スコープ付きパッケージ名による識別性向上
- **モノレポ内識別**: 複数のfrontendプロジェクトがある場合の区別
- **将来性**: npm publishする可能性への対応

#### **スクリプト設計**

**Nuxtコマンド群**
```json
"dev": "nuxt dev",
"build": "nuxt build", 
"generate": "nuxt generate",
"preview": "nuxt preview"
```
- **dev**: 開発サーバー（HMR有効）
- **build**: プロダクションビルド（SSR対応）
- **generate**: 静的サイト生成（SPA/SSG選択可能）
- **preview**: ビルド結果のプレビュー

**"postinstall": "nuxt prepare"**
- **理由**: Nuxt 3の型生成・準備処理自動化
- **効果**: .nuxt/types.d.ts等の自動生成
- **必要性**: TypeScript厳格モードでの型解決

**TypeScriptチェック**
```json
"type-check": "vue-tsc --noEmit"
```
- **vue-tsc使用理由**: Vue SFC（Single File Component）対応
- **--noEmitオプション**: ファイル出力なし（型チェックのみ）
- **Nuxtビルドとの分離**: ビルドプロセスとは独立した型検証

**テストスクリプト**
```json
"test": "vitest",
"test:ui": "vitest --ui", 
"test:coverage": "vitest --coverage"
```
- **UI版**: ブラウザベースのテスト実行・デバッグ
- **カバレッジ**: テストカバレッジレポート生成

#### **本番依存関係（dependencies）**

**"nuxt": "3.13.2"**
- **選定理由**: 
  - Vue 3ベースの最新安定版
  - TypeScript標準サポート
  - ファイルベースルーティング
  - 自動import機能
- **バージョン固定理由**: ビルド再現性確保

**"vue": "3.5.10"**
- **選定理由**: 
  - Composition API完全サポート
  - TypeScript統合の向上
  - パフォーマンス改善
- **Nuxtとの関係**: Nuxtが内部で使用（明示的指定で管理）

**状態管理: Pinia**
```json
"@pinia/nuxt": "0.5.5",
"pinia": "2.2.4"
```
- **Pinia選定理由**:
  - **vs Vuex**: TypeScript完全対応
  - **軽量性**: 不要な機能を持たない
  - **Vue 3最適化**: Composition API対応
  - **開発体験**: DevTools統合、HMR対応
- **@pinia/nuxt**: Nuxt統合用プラグイン

**"@nuxt/eslint": "0.5.7"**
- **理由**: Nuxt専用ESLint設定
- **提供機能**: 
  - Nuxtの自動import認識
  - ファイルベースルーティング対応
  - Vue SFC内でのlint

#### **開発依存関係（devDependencies）**

**テストフレームワーク**
```json
"vitest": "2.1.2",
"@vitest/ui": "2.1.2",
"@vitest/coverage-v8": "2.1.2"
```
- **Vitest選定理由**:
  - **vs Jest**: Vite統合による高速起動
  - **ESModules対応**: 設定不要でimport/export
  - **TypeScript**: 追加設定不要
  - **Watch Mode**: ファイル変更での自動再実行
- **Coverage-v8**: V8エンジンのネイティブカバレッジ使用

**Vue テストユーティリティ**
```json
"@nuxt/test-utils": "3.14.3",
"@vue/test-utils": "2.4.6"
```
- **@nuxt/test-utils**: Nuxt固有の機能テスト（ルーティング等）
- **@vue/test-utils**: Vue componentの単体テスト

**DOM環境**
```json
"happy-dom": "15.7.4"
```
- **happy-dom選定理由**:
  - **vs jsdom**: 2-3倍高速なテスト実行
  - **軽量**: インストールサイズ約2MB（jsdomは16MB）
  - **Vitest推奨**: Viteエコシステム統合
  - **十分な機能**: Vue componentテストに必要なDOM API提供
- **除外したjsdom**: より完全だが、重量・低速

**TypeScript支援**
```json
"vue-tsc": "2.1.6"
```
- **役割**: Vue SFC（.vueファイル）のTypeScript型チェック
- **tscとの違い**: Vue固有の構文理解
- **Nuxtとの関係**: Nuxtビルドとは独立した型検証

#### **除外した依存関係と理由**

**UIフレームワーク系**
```json
// 使用しない理由
"tailwindcss": "CLAUDE.mdで使用禁止明記",
"vuetify": "カスタムデザイン要件のため不採用",
"quasar": "プロジェクト規模に対して過剰"
```

**状態管理系**
```json
// 使用しない理由  
"vuex": "TypeScript対応が劣る、Piniaが後継",
"@vueuse/core": "必要に応じて後で追加検討"
```

**テスト系**
```json
// 使用しない理由
"jest": "ESModules設定複雑、Vitestが高速",
"cypress": "E2Eテスト用、Phase 0では不要",
"playwright": "E2Eテスト用、Phase 0では不要"
```

### 3.3 将来的な拡張予定

**Phase 1で追加検討**
```json
"@vueuse/core": "Vue utilities集",
"@vueuse/nuxt": "Nuxt統合",
"zod": "バリデーションライブラリ"
```

**Phase 2で追加検討**
```json
"@sentry/nuxt": "エラー監視",
"@nuxtjs/google-analytics": "分析ツール"
```

## 4. バックエンドpackage.json設計

### 4.1 設定内容

```json
{
  "name": "@family-tree-app/backend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch --clear-screen=false src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "type-check": "tsc --noEmit",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx src/prisma/seed.ts",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset"
  },
  "dependencies": {
    "express": "4.21.1",
    "@types/express": "5.0.0",
    "prisma": "5.22.0",
    "@prisma/client": "5.22.0",
    "dotenv": "16.4.5",
    "zod": "3.23.8"
  },
  "devDependencies": {
    "tsx": "4.19.2",
    "jest": "29.7.0",
    "@types/jest": "29.5.12",
    "ts-jest": "29.2.5",
    "supertest": "7.0.0",
    "@types/supertest": "6.0.2"
  }
}
```

### 4.2 各項目の設計理由

#### **基本設定**

**"type": "module"**
- **理由**: フロントエンドとの統一、モダンJavaScript使用
- **Prisma対応**: Prisma 5.x はESModules完全対応
- **Node.js 22.18**: ネイティブESModulesサポート

#### **スクリプト設計**

**開発環境**
```json
"dev": "tsx watch --clear-screen=false src/index.ts"
```
- **tsx選定理由**:
  - **vs ts-node**: ESModules対応、高速起動
  - **vs nodemon**: TypeScript直接実行、設定不要
  - **watch mode**: ファイル変更時の自動再起動
- **--clear-screen=false**: Docker環境でのログ保持

**ビルド・実行**
```json
"build": "tsc",
"start": "node dist/index.js"
```
- **tsc**: TypeScriptネイティブコンパイラ使用
- **出力**: dist/ディレクトリ（tsconfig.jsonで指定）
- **本番実行**: コンパイル後のJavaScript実行

**テスト**
```json
"test": "jest",
"test:coverage": "jest --coverage"
```
- **Jest選定理由**:
  - **vs Vitest**: バックエンド特化、豊富なモック機能
  - **Node.js実績**: サーバーサイドテストでの実績
  - **supertest親和性**: APIテスト時の連携

**データベース操作**
```json
"db:migrate": "prisma migrate dev",
"db:seed": "tsx src/prisma/seed.ts",
"db:studio": "prisma studio",
"db:reset": "prisma migrate reset"
```
- **migrate**: スキーマ変更のデータベース反映
- **seed**: 初期データ投入（TypeScript直接実行）
- **studio**: ブラウザベースのDB管理UI
- **reset**: 開発時の完全リセット

#### **本番依存関係（dependencies）**

**Express.js + TypeScript**
```json
"express": "4.21.1",
"@types/express": "5.0.0"
```
- **Express選定理由**:
  - **vs Fastify**: 豊富なエコシステム、学習コスト低
  - **vs Koa**: ミドルウェア豊富、安定性重視
  - **vs NestJS**: プロジェクト規模に適している軽量性
- **型定義配置理由**: ランタイム・開発時両方で必要

**Prisma ORM**
```json
"prisma": "5.22.0",
"@prisma/client": "5.22.0"
```
- **Prisma選定理由**:
  - **vs TypeORM**: 型安全性、マイグレーション管理優位
  - **vs Sequelize**: TypeScript統合、モダンAPI
  - **vs Drizzle**: エコシステム成熟度、学習リソース豊富
- **バージョン統一**: prismaとclientの同期必須
- **データベース設計書整合性**: docs/02_technical/02_database_design.mdとの一貫性

**環境変数・バリデーション**
```json
"dotenv": "16.4.5",
"zod": "3.23.8"
```
- **dotenv**: .envファイル読み込み（Docker環境での設定管理）
- **zod選定理由**:
  - **vs Joi**: TypeScript統合、型推論優位
  - **vs Yup**: パフォーマンス、軽量性
  - **用途**: APIリクエスト検証、環境変数検証

#### **開発依存関係（devDependencies）**

**TypeScript実行**
```json
"tsx": "4.19.2"
```
- **用途**: 開発サーバー、シードスクリプト実行
- **選定理由**: ESModules対応、高速起動、設定不要

**テストフレームワーク**
```json
"jest": "29.7.0",
"@types/jest": "29.5.12",
"ts-jest": "29.2.5"
```
- **Jest選定理由**:
  - **バックエンド特化**: サーバーサイドテストの豊富な実績
  - **モック機能**: Express middleware、Prisma clientの詳細モック
  - **設定の安定性**: TypeScript + ESModules設定が確立
- **ts-jest**: TypeScriptファイル直接実行

**APIテスト**
```json
"supertest": "7.0.0",
"@types/supertest": "6.0.2"
```
- **supertest選定理由**:
  - **Express統合**: 専用設計、簡潔なAPIテスト
  - **vs axios**: HTTPサーバーテスト特化、ポート管理不要
  - **用途**: APIエンドポイントの統合テスト
- **具体例**:
  ```javascript
  test('GET /api/people', async () => {
    const response = await request(app)
      .get('/api/people')
      .expect(200)
      .expect('Content-Type', /json/);
    expect(response.body).toHaveProperty('data');
  });
  ```

#### **Phase 1で除外した依存関係と理由**

**セキュリティ系**
```json
// Phase 1では不要（ローカル開発のみ）
"cors": "フロント・バック分離だが同一Docker環境のため不要",
"helmet": "セキュリティヘッダー設定、本番デプロイ時（Phase 2）に追加"
```

**認証系**
```json
// Phase 2で追加予定
"jsonwebtoken": "JWT認証実装時",
"bcrypt": "パスワードハッシュ化時",
"passport": "認証戦略実装時"
```

**フレームワーク系**
```json
// 使用しない理由
"nestjs": "プロジェクト規模に対して過剰、学習コスト高",
"fastify": "Expressエコシステム活用のため",
"koa": "Express選択により不要"
```

**ORM系**
```json
// 使用しない理由
"typeorm": "型安全性・マイグレーション管理でPrismaが優位",
"sequelize": "TypeScript統合の複雑さ",
"mongoose": "MongoDB用、MySQL使用のため不適合"
```

### 4.3 将来的な拡張予定

**Phase 2で追加検討**
```json
"jsonwebtoken": "JWT認証実装",
"bcrypt": "パスワードハッシュ化", 
"@types/jsonwebtoken": "JWT型定義",
"@types/bcrypt": "bcrypt型定義",
"cors": "本番環境でのクロスオリジン対応",
"helmet": "セキュリティヘッダー設定"
```

**Phase 3で追加検討**
```json
"winston": "ログ管理",
"@sentry/node": "エラー監視",
"express-rate-limit": "レート制限"
```

## 5. 共有ライブラリ（shared）の扱い

### 5.1 package.json不要の設計判断

**現在の状況**
- **用途**: 型定義、共通定数、共通ユーティリティ
- **依存関係**: 現時点で外部ライブラリ依存なし
- **ビルド**: 当面不要（直接.tsファイル参照）

**package.json不要の理由**
1. **ワークスペース管理**: ルートのworkspaces設定でnode_modules共有
2. **依存関係**: 独自の外部依存関係が現在存在しない
3. **アクセス方法**: `@shared/*`エイリアスで直接参照
4. **保守性**: 必要になった時点での追加が容易

### 5.2 アクセス方法

```typescript
// フロントエンド・バックエンドから共通でアクセス
import { PersonType } from "@shared/types/person"
import { API_ROUTES } from "@shared/constants/api-routes"
import { formatDate } from "@shared/utils/date"
```

### 5.3 将来的なpackage.json追加時期

**追加が必要になるケース**
- 外部ライブラリへの依存関係発生
- ビルドプロセスが必要になった場合
- npm publishする場合

**その時の最小構成**
```json
{
  "name": "@family-tree-app/shared",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./index.ts"
}
```

---

**重要**: この設計は**保守性**と**開発効率**のバランスを重視しています。新しい依存関係追加時は、プロジェクト全体への影響を慎重に検討してください。