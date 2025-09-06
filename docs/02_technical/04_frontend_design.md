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
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  css: ['~/assets/css/main.css'],
  modules: ['@pinia/nuxt'],
})
```

**各設定の理由**:

- **`devtools: { enabled: true }`**
  - **目的**: Vue DevToolsによる開発効率向上
  - **効果**: コンポーネント状態の可視化、Pinia状態管理の監視

- **`ssr: false`**
  - **目的**: SPAモードでの動作

- **`css: ['~/assets/css/main.css']`**
  - **目的**: グローバルCSS定義
  - **内容**: CSS Reset、カラーパレット、レスポンシブ変数
  - **理由**: コンポーネント個別の`<style scoped>`では共有変数が使用不可

- **`modules: ['@pinia/nuxt']`**
  - **目的**: 状態管理ライブラリ設定

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
