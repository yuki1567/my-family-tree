# Biome設定ガイド

## 1. 概要

### 1.1 設定方針

コード品質の自動保証: Biomeでリンティング・フォーマット・import整理を単一ツールに統合（ESLint + Prettierの2ツール構成を置き換え）

### 1.2 適用範囲

- **対象ファイル**: `.ts`, `.js`, `.mjs`, `.cjs`, `.vue`, `.json`, `.css`
- **除外対象**: `node_modules`, `dist`, `.nuxt`, `.output`, `coverage`, `public`, `.vscode`, `.git`, `database/migrations`, `package-lock.json`, ログファイル
- **実行タイミング**: ファイル保存時、手動実行、CI/CDパイプライン

> **実ファイル参照**: `biome.json`（モノレポルートに配置、全パッケージで共有）
> **コーディング規約**: `.claude/rules/code-quality.md` を参照

## 2. フォーマッター設定

### 2.1 各設定項目の選択理由

デフォルト値と異なる設定のみ`biome.json`に記述。

| 設定 | 値 | デフォルト | 選択理由 |
|------|-----|-----------|---------|
| indentStyle | space | tab | JavaScript/TypeScriptコミュニティ標準 |
| semicolons | asNeeded | always | セミコロンなしでコードがすっきり |
| quoteStyle | single | double | シングルクォートでJS標準に準拠 |
| trailingCommas | es5 | all | git diffクリーン化 |

## 3. リンタールール

### 3.1 各ルールの採用理由

| ルール | レベル | 採用理由 |
|--------|--------|---------|
| noConsole | warn | 本番環境でのコンソール出力抑制。意図的使用箇所ではbiome-ignoreで抑制 |
| noExplicitAny | error | any型禁止による型安全性確保。代替: unknown型、具体的な型定義 |
| noUnusedVariables / noUnusedImports | error | デッドコード削減、保守性向上 |
| noNonNullAssertion | error | 非null断言（`!`）禁止。適切なnullチェックを強制 |
| useConst | error | 再代入されない変数のconst使用強制 |
| useOptionalChain | error | `?.`使用強制でネストしたプロパティアクセスの安全性向上 |
| useShorthandAssign | error | 短縮代入演算子の使用強制 |

### 3.2 overrides設定の設計理由

| 対象パターン | 上書きルール | 理由 |
|-------------|-------------|------|
| scripts/** | noConsole: off | CLIスクリプトではconsole出力が正当な用途 |
| **/*.vue | noUnusedVariables/Imports: off | BiomeはVue SFCの`<template>`を解析できず、`<script>`定義をテンプレートで使用する変数を「未使用」と誤検出する |
| **/tests/** | noConsole: off | テストのセットアップ・デバッグでconsole出力は正当な用途 |

## 4. import自動整理

Biomeの`organizeImports`で自動的にimport文を整理・並び替え。

## 5. 運用指針

### 5.1 エラー対応

1. 一括修正（推奨）: `npm run check:fix`
2. コミット前確認: `npm run check`

### 5.2 設定変更時の手順

1. `biome.json`更新
2. 全ファイルに設定適用: `docker compose exec apps npm run check:fix`
3. チーム共有
