# Package.json設計書

## 1. 設計方針

### 1.1 モノレポ構成でのpackage.json役割分担

ルート・フロントエンド・バックエンドの3層構成。sharedは現時点でpackage.json不要（外部依存なし、`@shared/*`エイリアスで直接参照）。

> **実ファイル参照**: `package.json`, `apps/frontend/package.json`, `apps/backend/package.json`

### 1.2 依存関係管理戦略

- 共通依存関係はルートで一元管理（ホイスティング活用）
- 各アプリ固有の依存関係のみ個別管理
- バージョン固定によるビルド再現性確保

## 2. ルートpackage.json設計

### 2.1 基本設定の設計理由

| 設定 | 理由 |
|------|------|
| `"type": "module"` | ESModules統一。Node.js 22.18で完全サポート |
| `"workspaces"` | ホイスティング・統一node_modules管理・相互参照の簡易化 |
| `"private": true` | 公開予定なし |

### 2.2 スクリプト設計の設計理由

| パターン | 理由 |
|----------|------|
| 並列実行（`&`使用） | フロント・バック同時起動、型チェック並列実行による高速化 |
| ワークスペース委譲 | 各アプリのpackage.jsonに実装詳細を委譲し、個別起動・デバッグ対応 |
| ビルド順次実行（`&&`） | shared → backend → frontend の依存関係に基づく順序制御 |

### 2.3 共通開発依存関係の選定理由

| パッケージ | 選定理由 |
|-----------|----------|
| TypeScript | バージョン固定で全アプリの型互換性保証 |
| Biome | ESLint + Prettierの2ツール構成を1ツールに統合。設定簡素化と実行速度改善 |
| npm-run-all | 複数スクリプトの並列・直列実行 |
| tsx | TypeScriptスクリプトの直接実行（ESModules対応、高速起動） |
| dotenv | 環境変数管理（スクリプト用） |

## 3. フロントエンドpackage.json設計

### 3.1 基本設定の設計理由

- `@family-tree-app/frontend`: スコープ付きパッケージ名でモノレポ内識別性向上
- `postinstall: "nuxt prepare"`: Nuxt 3の型生成自動化（.nuxt/types.d.ts等）。TypeScript厳格モードでの型解決に必須

### 3.2 本番依存関係の選定理由

| パッケージ | 選定理由 | 比較対象 |
|-----------|----------|----------|
| Nuxt 3 | Vue 3ベース、TypeScript標準サポート、ファイルベースルーティング、自動import | - |
| Vue 3 | Composition API完全サポート、TypeScript統合向上 | - |
| Pinia | TypeScript完全対応、軽量、Vue 3最適化、DevTools/HMR対応 | vs Vuex: TS対応が劣る |
| @heroicons/vue | Vue 3用アイコンライブラリ | - |
| focus-trap | アクセシビリティ対応のフォーカストラップ | - |
| modern-normalize | モダンブラウザ対応CSSリセット | vs Normalize.css: 後継版 |

### 3.3 開発依存関係の選定理由

| パッケージ | 選定理由 | 比較対象 |
|-----------|----------|----------|
| Vitest | Vite統合高速起動、ESModules対応、TypeScript追加設定不要 | vs Jest: 設定が煩雑 |
| @vue/test-utils | Vue公式コンポーネントテストライブラリ | - |
| @nuxt/test-utils | Nuxt固有機能テスト（ルーティング等） | - |
| happy-dom | jsdomより2-3倍高速、インストールサイズ約2MB | vs jsdom: 16MB、低速 |
| vue-tsc | Vue SFCのTypeScript型チェック（tscはVue構文非対応） | - |

### 3.4 除外した技術と理由

| 除外技術 | 理由 |
|----------|------|
| Tailwind CSS | CLAUDE.mdで使用禁止（カスタムデザイン要件） |
| Vuetify / Quasar | カスタムデザイン要件 / プロジェクト規模に対して過剰 |
| Vuex | Piniaが後継、TypeScript対応が劣る |
| Cypress / Playwright | E2Eテスト用、現フェーズでは不要 |

## 4. バックエンドpackage.json設計

### 4.1 スクリプト設計の設計理由

| スクリプト | ツール | 選定理由 |
|-----------|--------|----------|
| dev | tsx watch | vs ts-node: ESModules対応・高速。vs nodemon: TS直接実行・設定不要。`--clear-screen=false`でDocker環境ログ保持 |
| build | tsc | TypeScriptネイティブコンパイラ。出力先: dist/ |
| test | Vitest | フロントエンドとの統一、ESModules対応、プロジェクト分離（unit/integration） |
| db:* | drizzle-kit | generate/migrate/push/studioの各操作を管理 |

### 4.2 本番依存関係の選定理由

| パッケージ | 選定理由 | 比較対象 |
|-----------|----------|----------|
| Hono | 完全な型安全性、Web標準準拠、マルチランタイム対応、軽量高速 | vs Express: 型安全性不足。vs Fastify: TS統合が劣る。vs NestJS: 過剰 |
| @hono/node-server | Node.js環境でのHono実行用アダプター | - |
| @hono/zod-validator | HonoとZodの統合（バリデーション処理の型安全化） | - |
| Drizzle ORM | SQL-like API、完全な型安全性、軽量高速 | vs Prisma: 重い。vs TypeORM: 型推論が劣る |
| postgres | PostgreSQL用JavaScriptクライアント | - |
| Zod v4 | TypeScript型推論、パフォーマンス、@hono/zod-validatorとの互換性 | vs Joi: TS統合不足。vs Yup: パフォーマンス劣る |

### 4.3 APIテスト方針

Honoの組み込み`app.request()`メソッドでテスト可能なため、supertestなどの外部ライブラリは不要。Web標準の`Request`/`Response`使用により、追加依存なしで型安全なテストが実現。

## 5. 共有ライブラリ（shared）の設計判断

### 5.1 package.json不要の理由

1. ルートのworkspaces設定でnode_modules共有済み
2. 独自の外部依存関係が現在存在しない
3. `@shared/*`エイリアスで直接参照可能
4. 必要になった時点での追加が容易

> **実ファイル参照**: `apps/shared/` ディレクトリ
