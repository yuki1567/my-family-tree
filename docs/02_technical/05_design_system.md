# デザインシステム

## 1. デザイン原則

### 1.1 基本方針

開発者が実装しやすく、ユーザーが直感的に操作できるデザインシステム

**核心原則**:

- **階層の明確化**: 情報の重要度を視覚的に表現
- **空白の活用**: 適切な余白による見やすさの向上
- **一貫性**: 統一されたパターンによる予測可能性
- **実用性**: 美しさより使いやすさを優先

### 1.2 対象ユーザー

- **メインユーザー**: 30-70 代の個人ユーザー
- **IT リテラシー**: 中程度
- **使用デバイス**: PC・タブレット・スマートフォン
- **使用シーン**: 家族の歴史記録・整理作業

## 2. カラーパレット

### 2.1 プライマリカラー

**ブランドカラー**: 温かみと親しみやすさを表現するオレンジ

```
Primary Orange
├── primary-50:  #fff7ed  (背景・ライト)
├── primary-100: #ffedd5  (ホバー・アクセント)
├── primary-500: #f97316  (メインカラー)
├── primary-600: #ea580c  (ボタン・リンク)
└── primary-700: #c2410c  (アクティブ状態)
```

**使用例**:

- primary-500: メインボタン、重要なリンク
- primary-600: ホバー状態、選択状態
- primary-100: 背景、軽いアクセント

### 2.2 セマンティックカラー

**性別表現カラー**: 家系図での人物識別

```
Male (男性) - 青系
├── male-50:  #eff6ff
├── male-100: #dbeafe
├── male-500: #3b82f6
└── male-600: #2563eb

Female (女性) - 暖色系
├── female-50:  #fdf2f8
├── female-100: #fce7f3
├── female-500: #ec4899
└── female-600: #db2777

Unknown (不明) - グレー系
├── unknown-50:  #f9fafb
├── unknown-100: #f3f4f6
├── unknown-500: #6b7280
└── unknown-600: #4b5563
```

### 2.3 機能カラー

**状態・フィードバック表現**

```
Success (成功) - 緑
├── success-50:  #f0fdf4
├── success-500: #22c55e
└── success-600: #16a34a

Warning (警告) - 黄
├── warning-50:  #fffbeb
├── warning-500: #f59e0b
└── warning-600: #d97706

Error (エラー) - 赤
├── error-50:  #fef2f2
├── error-500: #ef4444
└── error-600: #dc2626

Info (情報) - 青
├── info-50:  #eff6ff
├── info-500: #3b82f6
└── info-600: #2563eb
```

### 2.4 ニュートラルカラー

**背景・テキスト・ボーダー**

```
Gray Scale
├── gray-50:  #f9fafb  (最軽い背景)
├── gray-100: #f3f4f6  (軽い背景)
├── gray-200: #e5e7eb  (ボーダー・区切り線)
├── gray-300: #d1d5db  (無効状態)
├── gray-400: #9ca3af  (プレースホルダー)
├── gray-500: #6b7280  (補助テキスト)
├── gray-600: #4b5563  (本文テキスト)
├── gray-700: #374151  (見出し)
├── gray-800: #1f2937  (重要テキスト)
└── gray-900: #111827  (最も重要)

White & Black
├── white: #ffffff
└── black: #000000
```

## 3. タイポグラフィ

### 3.1 フォントファミリー

```css
/* システムフォント（高速・最適化済み） */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans JP",
  "Hiragino Kaku Gothic ProN", "ヒラギノ角ゴ ProN W3", Meiryo, sans-serif;
```

### 3.2 フォントサイズスケール

**16px 基準の調和的スケール**

```
タイトル・見出し
├── text-4xl: 36px (2.25rem) - ページタイトル
├── text-3xl: 30px (1.875rem) - セクションタイトル
├── text-2xl: 24px (1.5rem) - サブタイトル
├── text-xl:  20px (1.25rem) - 大きな見出し
└── text-lg:  18px (1.125rem) - 見出し

本文・UI
├── text-base: 16px (1rem) - 標準本文
├── text-sm:   14px (0.875rem) - 小さな本文
└── text-xs:   12px (0.75rem) - キャプション・注釈
```

### 3.3 フォントウェイト

```
├── font-normal: 400 - 標準本文
├── font-medium: 500 - 強調・ラベル
├── font-semibold: 600 - 見出し
└── font-bold: 700 - 重要な見出し
```

### 3.4 行間（Line Height）

```
├── leading-tight: 1.25 - 見出し
├── leading-normal: 1.5 - 標準本文
└── leading-relaxed: 1.625 - 長い文章
```

## 4. 間隔・レイアウト

### 4.1 スペーシングスケール

**8px 基準のスペーシングシステム**

```
├── space-1:  4px  (0.25rem) - 最小間隔
├── space-2:  8px  (0.5rem)  - 小間隔
├── space-3:  12px (0.75rem) -
├── space-4:  16px (1rem)    - 標準間隔
├── space-5:  20px (1.25rem) -
├── space-6:  24px (1.5rem)  - 中間隔
├── space-8:  32px (2rem)    - 大間隔
├── space-10: 40px (2.5rem)  -
├── space-12: 48px (3rem)    - セクション間
├── space-16: 64px (4rem)    - 大きなセクション間
└── space-20: 80px (5rem)    - ページ間
```

### 4.2 コンポーネント内余白

```
Padding (内側余白)
├── 小コンポーネント: px-3 py-2 (12px 8px) - ボタン・ラベル
├── 中コンポーネント: px-4 py-3 (16px 12px) - インプット・カード
└── 大コンポーネント: px-6 py-4 (24px 16px) - モーダル・パネル

Margin (外側余白)
├── 要素間: mb-4 (16px) - 標準要素間隔
├── セクション間: mb-8 (32px) - セクション区切り
└── ページ間: mb-12 (48px) - 大きな区切り
```

## 5. コンポーネントデザイン

### 5.1 ボタン

**階層に応じたボタンデザイン**

```
Primary Button (最重要アクション)
├── 背景: primary-500
├── テキスト: white
├── ホバー: primary-600
├── パディング: px-4 py-2
└── 角丸: rounded-md (6px)

Secondary Button (二次アクション)
├── 背景: white
├── テキスト: gray-700
├── ボーダー: gray-300
├── ホバー: gray-50
└── 同じパディング・角丸

Ghost Button (軽いアクション)
├── 背景: transparent
├── テキスト: primary-600
├── ホバー: primary-50
└── 同じパディング・角丸
```

### 5.2 入力フィールド

**明確で使いやすいフォーム**

```
Input Field
├── 背景: white
├── ボーダー: gray-300 (1px)
├── フォーカス: primary-500 (2px)
├── パディング: px-3 py-2
├── 角丸: rounded-md
└── フォントサイズ: text-base
```

### 5.3 カード

**情報を整理するコンテナ**

```
Card
├── 背景: white
├── ボーダー: gray-200 (1px)
├── シャドウ: subtle shadow
├── パディング: p-6
└── 角丸: rounded-lg (8px)
```

## 6. レイアウト原則

### 6.1 視覚的階層

**情報の重要度に応じた階層表現**

```
重要度レベル1 (最重要)
├── フォントサイズ: text-2xl+
├── フォントウェイト: font-bold
├── カラー: gray-900
└── 余白: 大きめのマージン

重要度レベル2 (重要)
├── フォントサイズ: text-lg
├── フォントウェイト: font-semibold
├── カラー: gray-700
└── 余白: 標準マージン

重要度レベル3 (標準)
├── フォントサイズ: text-base
├── フォントウェイト: font-normal
├── カラー: gray-600
└── 余白: 小さめマージン
```

### 6.2 グリッドシステム

**レスポンシブ対応のレイアウト**

```
Container Width
├── mobile: 100% (padding: 16px)
└── desktop: 768px~ (padding: 24px~32px)

Grid Columns
├── mobile: 1列
└── desktop: 2~3列（画面サイズに応じて調整）
```

## 7. アイコン・グラフィック

### 7.1 アイコンスタイル

```
アイコン仕様
├── スタイル: アウトライン（線幅2px）
├── サイズ: 16px, 20px, 24px
├── カラー: 文脈に応じたセマンティックカラー
└── 視覚的重量: 周囲のテキストと調和
```

### 7.2 家系図専用アイコン

```
性別アイコン
├── 男性: ♂ (male-500)
├── 女性: ♀ (female-500)
└── 不明: ? (unknown-500)

関係性アイコン
├── 生物学的: 実線 (primary-500)
├── 養子: 破線 (warning-500)
└── 関係線: ベジェ曲線
```

## 8. 状態・インタラクション

### 8.1 ホバー・フォーカス状態

```
Interactive States
├── ホバー: 背景色を1段階明るく + subtle shadow
├── フォーカス: 2px のアウトライン (primary-500)
├── アクティブ: 背景色を1段階暗く
└── 無効: opacity-50 + cursor-not-allowed
```

### 8.2 ローディング・フィードバック

```
Loading States
├── スピナー: primary-500 の回転アニメーション
├── スケルトン: gray-200 のプレースホルダー
├── プログレス: primary-500 のプログレスバー
└── 完了: success-500 のチェックマーク
```

## 9. レスポンシブ対応

### 9.1 ブレイクポイント

```
Breakpoints
├── mobile: ~767px
└── desktop: 768px~
```

### 9.2 適応的デザイン

```
Mobile First Approach
├── 基本: モバイル向けデザイン（~767px）
└── desktop: タブレット・PC最適化（768px~）
```

## 10. 実装ガイドライン

### 10.1 CSS クラス命名

```css
/* コンポーネントベースの命名 */
.family-tree-canvas {
}
.person-node {
}
.person-node.selected {
}
.person-node.male {
}

/* 状態クラス */
.loading {
}
.error {
}
.success {
}
```

### 10.2 CSS 変数

```css
:root {
  /* Primary Colors */
  --color-primary-50: #fff7ed;
  --color-primary-500: #f97316;
  --color-primary-600: #ea580c;

  /* Semantic Colors */
  --color-male-500: #3b82f6;
  --color-female-500: #ec4899;
  --color-unknown-500: #6b7280;

  /* Spacing */
  --space-4: 1rem;
  --space-8: 2rem;

  /* Typography */
  --font-size-base: 1rem;
  --line-height-normal: 1.5;
}
```

このデザインシステムにより、一貫性があり使いやすい家系図アプリの UI を実現できます。
