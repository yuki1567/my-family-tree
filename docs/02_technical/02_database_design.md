# データベース設計書

## 1. データベース概要

### 1.1 データベース基本情報

| 項目 | 値 |
|------|-----|
| RDBMS | PostgreSQL 18-alpine |
| 文字セット | UTF-8 |
| 照合順序 | ja_JP.UTF-8 |
| タイムゾーン | Asia/Tokyo（JST） |
| ORM | Drizzle ORM |
| ドライバー | postgres |
| 配置場所 | `apps/backend/database/` |

### 1.2 設計原則

保守性を最優先とした設計：

- **正規化**: 重複データの排除による一貫性確保
- **外部キー制約**: 参照整合性によるdata integrity担保
- **一意制約**: ビジネスルールをDB層で強制
- **論理削除**: 重要データの物理削除回避
- **UUID採用**: 分散環境での一意性確保
- **型安全性**: 共有型定義（shared/types/）との連携

### 1.3 一元管理フロー

データベース設計書 → Drizzleスキーマ → 型定義の一方向フロー。スキーマ変更はDrizzle Kitによる段階的更新。Drizzle ORMから推論される型を利用。

> **実ファイル参照**: `apps/backend/database/schema/`, `apps/backend/database/client.ts`

## 2. 命名規則

> **コーディング規約としての命名規則**: `.claude/rules/backend/database.md` を参照

### 2.1 命名の設計理由

| 規則 | 理由 |
|------|------|
| 全て小文字・snake_case | クロスプラットフォームでの一貫性、PostgreSQLの標準慣行 |
| テーブル名は複数形 | RESTfulリソース名との一貫性 |
| n:n関係テーブルは `{複数形}_{複数形}` | 関係する両テーブルが明確に表現される |
| 外部キーは `{テーブル名単数形}_id` | 参照先が明確 |
| 時間カラムは `受動態_at/on` | 日付のみ（`_on`）と日時（`_at`）を区別 |
| ENUM型不使用 → smallint | PostgreSQLでの拡張性とマイグレーション容易性 |
| 略語禁止 | 可読性優先（flg/kbn等の略名は利用しない） |

### 2.2 必須カラム

全テーブルに以下のカラムが必須：

| カラム | 型 | 理由 |
|--------|-----|------|
| id | UUID | グローバル一意性 |
| created_at | TIMESTAMP(3) | 監査ログ |
| updated_at | TIMESTAMP(3) | 変更追跡（Drizzle ORMの$onUpdateで自動更新） |

## 3. テーブル・カラム追加時の設計指針

### 3.1 データ型選択の設計理由

| 用途 | 推奨型 | 理由 |
|------|--------|------|
| ID | UUID (VARCHAR(36)) | 分散環境での一意性 |
| 短い文字列 | VARCHAR(n) | 長さ制限によるデータ品質保証 |
| 長い文字列 | TEXT | 制限なしの自由記述 |
| フラグ・ステータス | SMALLINT | ENUM型の代替、拡張性確保 |
| 日付のみ | DATE | タイムゾーン影響を排除 |
| 日時 | TIMESTAMP(3) | ミリ秒精度、PostgreSQLではON UPDATE非サポートのためアプリ層で制御 |

### 3.2 カラム追加のベストプラクティス

- 新規カラムはNULL許可またはDEFAULT値設定で既存データ影響を回避
- 検索頻度の高いカラムにはインデックス追加（命名: `idx_{テーブル名}_{カラム名}`）

### 3.3 インデックス戦略

対象: WHERE句・ORDER BY句・JOIN句で使用するカラム

## 4. データマイグレーション戦略

### 4.1 Drizzle Kitマイグレーション管理

マイグレーションファイル命名: `{連番}_{説明的な名前}.sql`

> **実ファイル参照**: `apps/backend/database/migrations/`, `apps/backend/database/schema/`

### 4.2 段階的スキーマ変更のフロー

1. スキーマファイル編集（`apps/backend/database/schema/`）
2. マイグレーション生成（`db:generate`）
3. 生成されたマイグレーションを確認
4. マイグレーション実行（`db:migrate`）

本番環境では自動適用ではなく手動での段階的な変更を推奨。

## 5. テーブル設計

### people（人物）テーブル

| フィールド | 型 | NULL | デフォルト | 説明 | 保守性への配慮 |
|-----------|----|----|----------|------|---------------|
| id | UUID | NO | gen_random_uuid() | 主キー | グローバル一意性 |
| name | VARCHAR(100) | YES | NULL | 氏名 | 無名人物対応 |
| gender | SMALLINT | NO | 0 | 性別（0:不明, 1:男性, 2:女性） | 将来的な拡張可能性 |
| birth_date | DATE | YES | NULL | 生年月日 | 不明日付の許容 |
| death_date | DATE | YES | NULL | 没年月日 | 生存者への配慮 |
| birth_place | VARCHAR(200) | YES | NULL | 出生地 | 地名変更への対応 |
| created_at | TIMESTAMP(3) | NO | CURRENT_TIMESTAMP | 作成日時 | 監査ログ |
| updated_at | TIMESTAMP(3) | NO | CURRENT_TIMESTAMP | 更新日時 | 変更追跡（$onUpdateで自動更新） |

> **実ファイル参照**: `apps/backend/database/schema/people.ts`
