# フロントエンド設計書

## 1. アーキテクチャ概要

### 1.1 技術設計原則

- **Single Page Application**: モーダルベースのアプリケーション構造
- **コンポーネント志向**: Atomic Design による再利用可能な設計
- **型安全性**: TypeScript strict mode による堅牢性
- **パフォーマンス重視**: SVG描画とレンダリング最適化
- **状態管理**: Pinia による効率的なデータフロー

### 1.2 技術スタック

- **フレームワーク**: Nuxt.js v3（SSR/SPA）
- **言語**: TypeScript（strict mode）
- **状態管理**: Pinia
- **スタイリング**: CSS（フレームワークレス、scoped style）
- **コンポーネント**: Vue 3 Composition API（script setup + TypeScript）
- **家系図描画**: SVG + Vue コンポーネント

### 1.3 Nuxt.js 3設定詳細

#### nuxt.config.ts設定内容と設定理由

```typescript
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    [
      '@nuxt/eslint',
      {
        config: {
          stylistic: false,
        },
      },
    ],
  ],

  // SPAモード
  ssr: false,

  // 開発設定
  devtools: { enabled: true },

  // CSS設定
  css: ['~/assets/css/main.css'],

  compatibilityDate: '2025-08-15',

  vite: {
    resolve: {
      preserveSymlinks: true,
    },
  },
})
```

**各設定の理由**:

- **`modules: ['@pinia/nuxt', '@nuxt/eslint']`**
  - **@pinia/nuxt**: 状態管理ライブラリの統合
  - **@nuxt/eslint**: Nuxt専用ESLint設定（Flat Config形式対応）
  - **stylistic: false**: スタイル関連ルールを無効化（Prettierに委譲）

- **`ssr: false`**
  - **目的**: SPAモードでの動作
  - **理由**: 家系図アプリは完全なクライアントサイドアプリケーションとして設計

- **`devtools: { enabled: true }`**
  - **目的**: Vue DevToolsによる開発効率向上
  - **効果**: コンポーネント状態の可視化、Pinia状態管理の監視

- **`css: ['~/assets/css/main.css']`**
  - **目的**: グローバルCSS定義
  - **内容**: CSS Reset、カラーパレット、レスポンシブ変数
  - **理由**: コンポーネント個別の`<style scoped>`では共有変数が使用不可

- **`compatibilityDate: '2025-08-15'`**
  - **目的**: Nuxt 3の互換性日付設定
  - **効果**: 将来の破壊的変更からの保護、安定性向上

- **`vite.resolve.preserveSymlinks: true`**
  - **目的**: シンボリックリンクの保持
  - **理由**: モノレポ構成での共有モジュール（@shared）の適切な解決

#### 設定除外項目と除外理由

- **`devServer設定`**: docker-compose.ymlでポートマッピング(3000:3000)管理済み
- **`typescript.strict設定`**: ルートtsconfig.jsonで"strict": true設定済み
- **`app.head メタタグ設定`**: 現フェーズ(UI/UX確認)では不要

### 1.4 CSS設計詳細

#### main.css設計理由

**設計判断の理由**:

- **modern-normalize採用理由**:
  - モダンブラウザ対応（IE非対応要件に適合）
  - normalize.cssより軽量で最適化済み
  - アクセシビリティ配慮が組み込み済み
  - ダウンロード使用：CDN依存回避、オフライン開発対応

- **CSS変数での色管理理由**:
  - **メインカラー（オレンジ）**: メニュー枠組み・フォーカス表示での統一使用
  - ドキュメント要件「男女別の色分け表示」への対応
  - 全コンポーネントでの統一色使用保証
  - 将来的なテーマ変更時の一括管理

- **ノードサイズのCSS変数化理由**:
  - ドキュメント仕様「120×80px固定」の統一管理
  - SVGコンポーネントとCSSでの同期確保
  - レスポンシブ時のサイズ調整容易性

- **レスポンシブブレイクポイント理由**:
  - 768px（デスクトップ）：タブレット以上をデスクトップとして統一
  - 実際の使用パターン（モバイル90%、デスクトップ10%）に基づく簡素化
  - タブレット専用設計は使用頻度が低いため除外
  - モバイルファースト設計との整合性

### 1.5 基本レイアウト設計

#### app.vue（全体共通レイアウト）

**設計方針**: 最小構成でNuxt.jsレイアウトシステムを活用

**理由**:

- 将来のレイアウト変更に対応可能な拡張性確保

#### pages/index.vue（メイン画面レイアウト）

### 1.6 Atomicデザインコンポーネント設計

#### コンポーネント構成と設計方針

**Atoms（基本UIパーツ）**:

**Molecules（複合コンポーネント）**:

**設計原則**:

- **CSS変数活用**: main.cssで定義したカラーパレット使用
- **性別色分け**: --color-male、--color-female、--color-unknownの活用
- **Vue 3 Composition API**: script setup + TypeScript厳格モード
- **再利用性**: 汎用的なprops設計による高い再利用性

### 1.3 制約事項

- **UI フレームワーク禁止**: Tailwind CSS、Bootstrap 等の使用不可
- **素の CSS**: scoped style によるカスタムスタイリングのみ
- **TypeScript 必須**: 全コンポーネントで`<script setup lang="ts">`使用
- **レスポンシブ必須**: PC・タブレット・スマートフォン対応（縦配置中心）

## 3. コンポーネント設計

### 3.1 コンポーネント階層

```
apps/frontend/
├── app.vue (Nuxtエントリーポイント)
├── pages/
│   └── index.vue (メインページ)
└── components/
    ├── atoms/ (基本UIパーツ)
    ├── molecules/ (複合UIコンポーネント)
    └── organisms/ (複雑なUIコンポーネント)
```

### 3.2 コンポーネント責務

### 3.3 状態管理設計

## 4. ユーティリティ設計

### 4.1 API エラーハンドリング

#### 概要

フロントエンドのAPI通信エラーを統一的に処理するユーティリティ機能です。エラーハンドリングの一貫性を確保し、ユーザーへの適切なフィードバックを提供します。

#### 実装場所

- `apps/frontend/utils/apiErrorHandler.ts`

#### 提供機能

##### 4.1.1 handleApiError

API エラーをハンドリングし、統一的な形式で返します。

```typescript
export function handleApiError(error: ApiError): ApiErrorHandlingResult
```

**返り値**:
- `message`: ユーザー向けのエラーメッセージ（日本語）
- `shouldShowToUser`: ユーザーに表示すべきかどうか
- `severity`: エラーの深刻度（`low` | `medium` | `high`）

**使用例**:
```typescript
const { message, shouldShowToUser } = handleApiError(error)
if (shouldShowToUser) {
  // ユーザーにエラーメッセージを表示
}
```

##### 4.1.2 formatErrorMessage

HTTPステータスコードとエラーコードから日本語エラーメッセージを生成します。

```typescript
export function formatErrorMessage(
  status: HttpStatusCode,
  errorCode?: string,
): string
```

**使用例**:
```typescript
const message = formatErrorMessage(404, 'NOT_FOUND')
// => 'データが見つかりません'
```

##### 4.1.3 logApiError

API エラーをコンソールにログ出力します。エラーの深刻度に応じて適切なログレベルで出力されます。

```typescript
export function logApiError(
  error: ApiError,
  context: string,
  endpoint: string,
): void
```

**ログレベル**:
- `high`: `console.error()`
- `medium`: `console.warn()`
- `low`: `console.log()`

**使用例**:
```typescript
logApiError(error, 'PersonAPI', 'GET /api/people')
// => [HIGH] API Error in PersonAPI - GET /api/people: サーバーエラーが発生しました
```

##### 4.1.4 ネットワークエラー処理

ネットワークエラーの検出とハンドリングを提供します。

```typescript
export function isNetworkError(error: unknown): boolean
export function handleNetworkError(): ApiErrorHandlingResult
```

**使用例**:
```typescript
if (isNetworkError(error)) {
  const result = handleNetworkError()
  // => { message: 'ネットワークエラーが発生しました...', ... }
}
```

#### エラー分類

##### HTTPステータスコード別の分類

| ステータス | 深刻度 | デフォルトメッセージ | 説明 |
|-----------|--------|---------------------|------|
| 400 | medium | 入力内容に誤りがあります | バリデーションエラー |
| 401 | high | 認証が必要です | 認証エラー |
| 403 | high | アクセス権限がありません | 権限エラー |
| 404 | medium | 要求されたデータが見つかりません | データ不見当 |
| 500 | high | サーバーエラーが発生しました | サーバーエラー |

##### エラーコード別のメッセージ

**共通エラーコード**:
- `VALIDATION_ERROR`: 入力内容に誤りがあります
- `UNAUTHORIZED`: 認証が必要です
- `FORBIDDEN`: アクセス権限がありません
- `NOT_FOUND`: データが見つかりません
- `INTERNAL_ERROR`: サーバーエラーが発生しました
- `DATABASE_ERROR`: データベースエラーが発生しました
- `UNEXPECTED_ERROR`: 予期しないエラーが発生しました

**バリデーションエラーコード**:
- `NAME_TOO_LONG`: 名前が長すぎます
- `INVALID_GENDER`: 性別の指定が不正です
- `INVALID_DATE_FORMAT`: 日付の形式が不正です
- `DEATH_BEFORE_BIRTH`: 死亡日が生年月日より前になっています
- `BIRTH_PLACE_TOO_LONG`: 出生地が長すぎます

#### 型定義

##### ApiError型

```typescript
export type ApiError = {
  status: HttpStatusCode
  message?: string
  response?: ApiErrorResponse
}
```

##### ApiErrorHandlingResult型

```typescript
export type ApiErrorHandlingResult = {
  message: string
  shouldShowToUser: boolean
  severity: 'low' | 'medium' | 'high'
}
```

#### apps/shared/typesとの連携

`apps/shared/types/response.ts`で定義されている以下の型を使用します：

- `ApiErrorResponse`: APIエラーレスポンスの型
- `ErrorResponse`: エラーレスポンスの詳細型
- `HttpStatusCode`: HTTPステータスコードのリテラル型
- `ErrorCode`: エラーコードのリテラル型
- `ValidationErrorCode`: バリデーションエラーコードのリテラル型

これにより、バックエンドとフロントエンドで一貫したエラー処理が実現されます。

#### 設計原則

- **TypeScript strict mode準拠**: 型安全性を確保
- **シンプルなAPIインターフェース**: 使いやすく、理解しやすい関数群
- **一貫性**: 全てのAPI通信で同じエラーハンドリング方法を使用
- **ユーザビリティ**: 日本語の分かりやすいエラーメッセージ
- **保守性**: エラーメッセージの一元管理により、変更が容易

#### テスト

各関数の単体テストを`apps/frontend/tests/unit/utils/apiErrorHandler.test.ts`に実装しています。

**テストカバレッジ**:
- HTTPステータスコード別のエラーハンドリング
- エラーコード別のメッセージ変換
- バリデーションエラー詳細の処理
- ネットワークエラーの検出
- ログ出力機能
