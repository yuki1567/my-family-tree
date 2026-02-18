---
name: codex-review
description: Codex MCPを使用して現在のブランチのPull Requestをコードレビューする
disable-model-invocation: true
user-invocable: true
allowed-tools: Bash, mcp__codex__codex, Read, Glob, Grep
---

# Codex PRレビュースキル

現在のブランチに紐づくPull Requestの変更内容をCodex MCPで分析し、プロジェクト規約に基づいた日本語コードレビューを提供する。

## 実行手順

### ステップ1: PR情報の収集

現在のブランチに紐づくPRを自動取得する。引数は不要。

```bash
# PR詳細情報の取得（現在のブランチから自動取得）
gh pr view --json number,title,body,labels,files

# PR差分の取得
gh pr diff

# PRで変更されたファイル一覧
gh pr diff --name-only
```

PRが見つからない場合は「現在のブランチにPRが存在しません。先にPRを作成してください。」と表示して終了する。

### ステップ2: プロジェクトルールの読み込み

以下のルールファイルをすべて読み込み、Codexプロンプトに埋め込むための規約情報として保持する:

- `.claude/rules/coding-standards.md`
- `.claude/rules/code-quality.md`
- `.claude/rules/backend/architecture.md`
- `.claude/rules/backend/testing.md`
- `.claude/rules/backend/database.md`
- `.claude/rules/frontend/conventions.md`
- `.claude/rules/frontend/testing.md`

### ステップ3: Codex MCPでレビュー実行

収集したPR情報とプロジェクトルールを使って、`mcp__codex__codex` を呼び出す。

**パラメータ:**

- `cwd`: プロジェクトルートパス
- `sandbox`: `read-only`
- `approval-policy`: `never`

**promptテンプレート:**

以下のテンプレートの `[...]` 部分をステップ1・2で収集した情報で埋めてプロンプトを構築する:

```
あなたはFamily Treeプロジェクト（Nuxt.js v3 + Hono + Drizzle ORM + PostgreSQL）の熟練コードレビュアーです。
日本語でレビューしてください。

## レビュー対象

PR #[PR番号]: [PRタイトル]

## PR差分

[gh pr diffの出力を貼り付け]

## プロジェクトのコーディング規約

[読み込んだルールファイルの内容をすべて貼り付け]

## レビュー観点

以下の観点でレビューしてください。各観点ごとに問題があれば具体的にファイル名と該当箇所を示して指摘し、問題がなければ「問題なし」と記載してください。

### 1. TypeScript規約
- strict mode準拠
- `type` over `interface`（型定義はすべて `type` を使用しているか）
- `enum` 禁止（Union Typesを使用しているか）
- `any` 禁止（`unknown` を使用しているか）
- 型アサーション `as` 禁止（`as const` のみ許可。型ガード、Zod validation、型ナローイングを使用しているか）
- 非nullアサーション `!` 禁止（適切なnullチェックをしているか）
- 関数の戻り値型が明示的に宣言されているか
- `readonly` が不変フィールドに使用されているか
- ユーティリティ型（`Omit`, `Partial`, `Pick`）を活用しているか
- 命名規則: 変数・関数=camelCase、定数=UPPER_SNAKE_CASE、型・クラス=PascalCase、ディレクトリ=lowercase
- コメントはWHYのみ記述しているか（WHATコメントがないか）

### 2. バックエンドアーキテクチャ
- レイヤード構造の単方向依存（Routes → Services → Repositories）が守られているか
- 各レイヤーの責務分離: Route=HTTPハンドリング+Zod検証(Arrow functions)、Service=ビジネスロジック(Class-based)、Repository=データアクセス(Class-based)
- `zValidator` + `@shared/api/` からインポートしたZodスキーマを使用しているか
- レスポンス形式: 成功 `{ data: ... }` / エラー `{ error: { statusCode, errorCode, details } }` に準拠しているか
- 型付きレスポンス `c.json<ResponseType>(...)` を使用しているか
- 共有型・スキーマが `@shared/api/` / `@shared/constants/` からインポートされているか
- エラーハンドリング3層が正しく実装されているか:
  1. `zValidator` → ZodError → 400 VALIDATION_ERROR
  2. Route handler try-catch → `DatabaseError` ラッピング → 500
  3. `errorHandler` middleware → 未ハンドルエラーをキャッチ
- リファレンス実装（`routes/peopleRoute.ts`, `services/personService.ts`, `repositories/personRepository.ts`）のパターンに従っているか

### 3. フロントエンド規約
- Atomic Design（Atoms/Molecules/Organisms）の分類が適切か
- `<script setup lang="ts">` を使用しているか
- PascalCaseファイル名か
- `<script setup>` 内の順序: imports → Props/Emits → reactive data → computed → watchers → methods
- `withDefaults(defineProps<Props>(), ...)` で型付きpropsを定義しているか
- `defineEmits<Emits>()` で型付きemitsを定義しているか（配列形式禁止）
- `data-testid` 属性がテスト対象要素にあるか
- UIフレームワーク（Tailwind, Bootstrap等）を使用していないか
- `<style scoped>` を使用しているか
- CSS変数が `assets/css/main.css` で定義されたものを使用しているか
- CSSクラス名がkebab-caseか
- Pinia/Composablesの使い分けが適切か
- Arrow functionsで記述されているか

### 4. データベース規約
- テーブル名: lowercase, snake_case, 複数形
- カラム名: snake_case, 省略なし（`birth_date` ○ / `birth_dt` ✕）
- 必須カラム `id`(UUID), `created_at`, `updated_at` があるか
- 外部キー: `{singular}_id` 形式
- 日時カラム: `*_at`（datetime）/ `*_on`（date only）
- フラグ: `is_*`, `has_*` 形式
- ENUM型を使用していないか（`smallint` + 定数で代替すべき）
- Drizzleスキーマが `apps/backend/database/schema/` に配置されているか
- `$onUpdate` で `updated_at` 自動更新が設定されているか

### 5. テスト規約
- バックエンド: Integration 60% / Unit 40% の比率方針に沿っているか
- バックエンドUnit: Service層（リポジトリをモック）、Zod validation、ユーティリティ関数をテストしているか
- バックエンドIntegration: API全体フロー（Route→Service→Repository→DB）をテストしているか
  - `singleThread: true` で直列実行しているか
  - `beforeEach` でテストデータを削除しているか
  - `app.request()` を使用しているか（supertestではなく）
  - 作成IDでDB検証しているか（全テーブル検索ではなく）
- フロントエンド: Unit 70% / Integration 30% の比率方針に沿っているか
- フロントエンドUnit: コンポーネント、composables、utils、storesをテストしているか
- フロントエンドIntegration: ページレンダリング、ルーティング、APIフローをテストしているか
  - happy-dom環境を使用しているか
  - `@vue/test-utils` の `mount()` を使用しているか
- テストファイル命名: `*.test.ts`

### 6. コード品質
- Biome（`biome.json`）の規約に準拠しているか
- `biome-ignore` を使用している場合: `// biome-ignore lint/{category}/{rule}: {reason}` 形式で理由が記載されているか
- インポート順序はBiomeの自動ソートに委ねているか

### 7. セキュリティ・パフォーマンス
- すべての外部入力にZod validationが適用されているか
- N+1クエリの可能性がないか
- 機密情報（トークン、キー、パスワード）がコードにハードコードされていないか
- 不要な依存関係が追加されていないか
- SQLインジェクション、XSS等のOWASP Top 10脆弱性がないか

## 出力形式

以下の形式で出力してください:

### レビューサマリー
[全体的な評価を1-2文で]

### 🔴 必須修正（Must Fix）
[修正しないとマージすべきでない問題。ファイル名と該当箇所を明記]

### 🟡 推奨修正（Should Fix）
[修正が望ましい問題。ファイル名と該当箇所を明記]

### 🟢 提案（Nice to Have）
[改善提案・ベストプラクティスの推奨]

### 良い点
[PRの優れている点を具体的に挙げる]
```

### ステップ4: レビュー結果の表示

Codexからのレビュー結果をそのままユーザーに表示する。

**注意事項:**
- PR差分が500行を超える場合は、変更ファイル一覧を先に提示し、重要なファイルに絞ってレビューするか確認する
- 差分がCodexのコンテキストに収まらない場合は、ファイル単位で分割して複数回レビューを実行する
