# フロントエンド設計書

## 1. アーキテクチャ概要

### 1.1 設計原則

- **Single Page Application**: モーダルベースの UI 設計
- **モバイルファースト**: レスポンシブデザインの採用
- **コンポーネント志向**: 再利用可能な設計
- **型安全性**: TypeScript strict mode による堅牢性
- **パフォーマンス重視**: SVG 描画とレンダリング最適化

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
  modules: ['@pinia/nuxt']         
})
```

**各設定の理由**:

- **`devtools: { enabled: true }`**
  - **目的**: Vue DevToolsによる開発効率向上
  - **効果**: コンポーネント状態の可視化、Pinia状態管理の監視

- **`ssr: false`**
  - **目的**: SPAモードでの動作
  - **理由**: Phase 1は静的表示のみ、認証機能未実装のため
  - **メリット**: シンプルな開発環境、クライアントサイドレンダリング

- **`css: ['~/assets/css/main.css']`**
  - **目的**: グローバルCSS定義
  - **内容**: CSS Reset、カラーパレット、レスポンシブ変数
  - **理由**: コンポーネント個別の`<style scoped>`では共有変数が使用不可

- **`modules: ['@pinia/nuxt']`**
  - **目的**: Phase 1-B準備としての状態管理ライブラリ設定
  - **Phase 1-A**: 使用しない（静的表示のみ）
  - **Phase 1-B**: 人物データ・関係データの状態管理で使用予定

#### 設定除外項目と除外理由

- **`devServer設定`**: docker-compose.ymlでポートマッピング(3000:3000)管理済み
- **`typescript.strict設定`**: ルートtsconfig.jsonで"strict": true設定済み
- **`app.head メタタグ設定`**: 現フェーズ(UI/UX確認)では不要

### 1.4 CSS設計詳細

#### main.css構成と設計理由

**ファイル構成**:
```css
/* assets/css/main.css */
@import 'modern-normalize/modern-normalize.css';  /* リセットCSS */

:root {
  /* メインカラー */
  --color-primary: #F97316;    /* メインカラー：オレンジ（メニュー枠・フォーカス用） */
  --color-blue: #3B82F6;       /* 補助色：青系 */
  
  /* 性別色分け */
  --color-male: #56b4f5;       /* 男性：青系 */
  --color-female: #f1878c;     /* 女性：ピンク系 */
  --color-unknown: #9CA3AF;    /* 性別不明：グレー */
  
  /* 家系図ノードサイズ（ドキュメント仕様準拠） */
  --node-width: 120px;
  --node-height: 80px;
  --node-gap-horizontal: 160px;
  --node-gap-vertical: 120px;
  
  /* レスポンシブブレイクポイント */
  --breakpoint-desktop: 768px;
}
```

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

#### 依存関係管理

**package.json追加**:
```json
{
  "dependencies": {
    "modern-normalize": "^2.0.0"
  }
}
```

**理由**: CDN依存回避、バージョン固定による安定性確保

### 1.5 基本レイアウト設計

#### app.vue（全体共通レイアウト）

**設計方針**: 最小構成でNuxt.jsレイアウトシステムを活用

```vue
<template>
  <div id="app">
    <NuxtPage />
  </div>
</template>
```

**理由**: 
- シンプルな構成でPhase 1-Aの静的表示確認に最適
- 将来のレイアウト変更に対応可能な拡張性確保

#### pages/index.vue（メイン画面レイアウト）

**構成要素**:
- ヘッダー: アプリ名・設定ボタン
- 家系図表示エリア: メインコンテンツ（Phase 1-Aではプレースホルダー）
- コントロールパネル: ズーム・表示設定ボタン
- フローティング追加ボタン: 人物追加用

**レイアウト手法**: Flexboxを採用

```css
.main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.content-area {
  display: flex;
  flex: 1;
}

.family-tree-area {
  flex: 1;  /* メイン領域 */
}

.control-panel {
  flex: 0 0 auto;  /* 固定幅 */
}
```

**Flexbox採用理由**:
- **シンプル性**: CSS Gridより理解・保守が容易
- **適切性**: 基本的な1次元レイアウトの組み合わせで十分
- **レスポンシブ対応**: flex-directionの変更で簡単に対応
- **フレキシブル性**: コンテンツサイズに応じた柔軟な調整

### 1.6 Atomicデザインコンポーネント設計

#### コンポーネント構成と設計方針

**Atoms（基本UIパーツ）**:
- **AppButton.vue**: 統一されたボタンスタイル（variant: primary/secondary/danger, size: small/medium/large）
- **AppInput.vue**: v-model対応入力フィールド（type: text/email/date/number）
- **LoadingSpinner.vue**: CSSアニメーション使用のローディング表示

**Molecules（複合コンポーネント）**:
- **FormField.vue**: AppInputにラベル・エラーメッセージを統合
- **PersonCard.vue**: 人物情報表示カード（性別色分け、写真/イニシャル表示）

**型定義設計**:
```typescript
// types/components.ts - type使用（interface禁止制約準拠）
export type ButtonVariant = 'primary' | 'secondary' | 'danger'
export type ButtonSize = 'small' | 'medium' | 'large'
export type InputType = 'text' | 'email' | 'date' | 'number'
export type Gender = 'male' | 'female' | 'unknown'

export type Person = {
  readonly id: string
  name?: string
  gender?: Gender
  birthDate?: string
  deathDate?: string
  photo?: string
}
```

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

## 2. アプリケーション構造

### 2.1 画面構成

**Single Page Application（SPA）設計**

#### メイン画面

- **ヘッダー**: アプリ名、メニューボタン、設定ボタン
- **家系図表示エリア**: SVG キャンバス（メインコンテンツ）
- **コントロールパネル**: ズーム、表示設定、フィルタ
- **フローティングボタン**: 人物追加、検索（Phase 2）

#### モーダル画面（オーバーレイ表示）

- **人物詳細モーダル**: 情報表示・編集・関係性管理
- **設定モーダル**: 表示設定・データ管理
- **検索モーダル**: 検索機能（Phase 2）
- **ヘルプモーダル**: 使い方ガイド

### 2.2 レスポンシブ対応

#### デスクトップ（768px 以上）

- **モーダル**: オーバーレイ表示（画面中央）
- **操作**: マウス・キーボード・タッチ操作対応
- **レイアウト**: 縦配置中心（家系図も縦スクロール対応）
- **対象デバイス**: タブレット、PC含む

#### モバイル（768px 未満）

- **モーダル**: フルスクリーン表示
- **操作**: タッチ操作最適化
- **レイアウト**: 縦配置中心（縦スクロール最適化）
- **対象デバイス**: スマートフォン

## 3. コンポーネント設計

### 3.1 コンポーネント階層

```
apps/frontend/
├── app.vue (Nuxtエントリーポイント)
├── pages/
│   └── index.vue (メインページ)
└── components/
    ├── atoms/ (基本UIパーツ)
    │   ├── AppButton.vue
    │   ├── AppInput.vue
    │   ├── AppSelect.vue
    │   ├── AppTextarea.vue
    │   └── LoadingSpinner.vue
    ├── molecules/ (複合UIコンポーネント)
    │   ├── FormField.vue
    │   ├── PersonCard.vue
    │   ├── RelationshipItem.vue
    │   └── SearchBox.vue
    └── organisms/ (複雑なUIコンポーネント)
        ├── FamilyTreeCanvas.vue (家系図メイン)
        ├── PersonNode.vue (人物ノード)
        ├── RelationshipLine.vue (関係線)
        ├── TreeControls.vue (操作コントロール)
        ├── PersonModal.vue (人物詳細モーダル)
        ├── PersonForm.vue (人物編集フォーム)
        ├── SearchModal.vue (検索モーダル - Phase 2)
        ├── SettingsModal.vue (設定モーダル)
        └── BaseModal.vue (基本モーダル)
```

### 3.2 コンポーネント責務

#### FamilyTreeCanvas（家系図メインコンポーネント）

**責務**: 家系図全体の表示制御・操作管理

- SVG キャンバス管理
- ズーム・パン操作制御
- レイアウト計算結果の表示
- 人物・関係クリックイベント処理
- レスポンシブ対応

**実装仕様（2025-08-15実装中）**:
- **座標計算アルゴリズム**: DFS（深度優先探索）による世代別レイアウト
- **ViewBox動的調整**: `viewBox="${x} ${y} ${width} ${height}"`でズーム・パン対応
- **階層構造**: 関係線レイヤー（下層）+ 人物ノードレイヤー（上層）
- **ズーム範囲**: 0.5x〜2.0x（0.2刻み）
- **背景グリッド**: 開発用・40px間隔（非表示切替可能）

#### PersonNode（人物ノードコンポーネント）

**責務**: 個別人物の表示

- 人物情報の視覚表示
- 性別による色分け
- 写真・アイコン表示
- 名前・日付表示
- 選択・ハイライト状態表示

#### PersonModal（人物詳細モーダル）

**責務**: 人物情報の詳細表示・編集

- 人物情報フォーム
- 写真アップロード機能
- 関係性設定・編集
- バリデーション・エラー表示
- 削除確認

#### RelationshipLine（関係線コンポーネント）

**責務**: 親子関係の視覚的表現

- 親子間の線描画
- 関係タイプ別の表示（生物学的・養子）
- ホバー・選択状態の表示

#### TreeControls（操作コントロール）

**責務**: 家系図操作 UI

- ズーム制御
- 表示設定（写真・日付表示切替）
- 世代フィルタ
- ビューリセット

### 3.3 状態管理設計

#### Person Store

**責務**: 人物データの管理

- 人物一覧の保持・操作
- CRUD 操作（作成・読取・更新・削除）
- LocalStorage 連携（Phase 1）
- API 連携（Phase 2）
- 検索・フィルタリング

#### Relationship Store

**責務**: 関係性データの管理

- 関係一覧の保持・操作
- 関係の作成・削除
- 循環参照チェック
- 親子関係の検証

#### UI Store

**責務**: UI 状態の管理

- モーダル開閉状態
- 家系図表示設定（ズーム・パン・フィルタ）
- 選択・ハイライト状態
- レスポンシブ状態

## 4. SVG 家系図設計

### 4.1 レイアウト設計

**階層型レイアウト**

- **世代別配置**: 縦方向に世代を配置
- **水平整列**: 同世代内で水平配置
- **中央寄せ**: 全体を画面中央に配置

**ノード仕様**:

- **サイズ**: 120px × 80px（固定）
- **間隔**: 水平 160px、垂直 120px
- **形状**: 角丸矩形（border-radius: 4px）

**関係線仕様**:

- **形状**: ベジェ曲線による滑らかな線
- **色分け**: 生物学的（緑）、養子（オレンジ）
- **太さ**: 通常 2px、選択時 3px

### 4.2 レスポンシブ SVG 設計

**ViewBox 動的調整**:

- PC: 固定サイズ（800×600）
- タブレット: 画面幅に合わせて調整
- スマートフォン: 画面サイズに最適化

**操作対応**:

- **PC**: マウスホイール（ズーム）、ドラッグ（パン）
- **タブレット**: ピンチジェスチャー、タッチドラッグ
- **スマートフォン**: タッチ操作最適化

### 4.3 パフォーマンス設計

**描画最適化**:

- **可視領域判定**: ViewBox 外のノード非表示
- **段階的レンダリング**: 大量データの分割表示
- **メモ化**: レイアウト計算結果のキャッシュ

**メモリ管理**:

- **不要ノード削除**: DOM 要素の適切な解放
- **イベントリスナー管理**: メモリリーク防止

## 5. レイアウト計算アルゴリズム

### 5.1 世代計算

**アルゴリズム**: 深度優先探索による世代決定

- **第 0 世代**: 親がいない人物
- **第 N 世代**: 親の最大世代数 + 1
- **循環参照検出**: visited set による無限ループ防止

### 5.2 座標計算

**水平配置**:

- 同世代内で等間隔配置
- 中央寄せでバランス調整

**垂直配置**:

- 世代間隔を一定に保持
- 上から下への階層表示

### 5.3 最適化アルゴリズム

**家族グループ最適化**:

- 兄弟姉妹の近接配置
- 親子関係の視覚的明確化

**全体バランス調整**:

- 画面中央への配置
- マージン・パディングの調整

## 6. インタラクション設計

### 6.1 操作フロー

#### 人物追加フロー

1. フローティング「+」ボタンクリック
2. 人物詳細モーダル表示（新規作成モード）
3. 基本情報入力（全項目任意）
4. 写真アップロード（任意）
5. 保存実行
6. 家系図に新人物表示

#### 関係設定フロー

1. 人物ノードクリック
2. 人物詳細モーダル表示（編集モード）
3. 関係性設定セクションで親選択
4. 関係タイプ選択（生物学的・養子）
5. 保存実行
6. 関係線が家系図に表示

### 6.2 バリデーション設計

**入力検証**:

- 日付整合性（没年月日 ≥ 生年月日）
- 関係循環チェック
- 重複関係防止

**エラー表示**:

- フィールド単位のエラーメッセージ
- 全体エラーの一括表示
- 分かりやすい日本語メッセージ

## 7. データ連携設計

### 7.1 ローカルストレージ連携（Phase 1）

**データ形式**: JSON
**保存タイミング**:

- 人物作成・更新・削除時
- 関係作成・削除時

**データ構造**:

```
{
  "people": Person[],
  "relationships": Relationship[],
  "metadata": {
    "version": string,
    "lastUpdated": Date
  }
}
```

### 7.2 API 連携設計（Phase 2）

**通信方式**: RESTful API
**データ同期**:

- 楽観的更新（即座に UI 反映）
- エラー時のロールバック
- オフライン対応

## 8. アクセシビリティ設計

### 8.1 WCAG 2.1 AA 準拠

**キーボード操作**:

- Tab 順序の論理的設定
- Enter/Space キーでの操作
- Escape キーでのモーダル閉じ

**スクリーンリーダー対応**:

- 適切な ARIA 属性設定
- セマンティック HTML の使用
- ランドマークの明確化

**色覚対応**:

- 色以外の情報伝達手段
- 十分なコントラスト比確保
- パターン・形状での差別化
