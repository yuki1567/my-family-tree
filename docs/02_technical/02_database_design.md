# データベース設計書

## 1. データベース概要

### 1.1 データベース基本情報

- **RDBMS**: MySQL 8.4.0
- **文字セット**: utf8mb4
- **照合順序**: utf8mb4_unicode_ci
- **タイムゾーン**: Asia/Tokyo（JST）
- **ORM**: Prisma
- **配置場所**: `apps/backend/src/prisma/`

### 1.2 設計原則

**保守性を最優先とした設計**

- **正規化**: 重複データの排除による一貫性確保
- **外部キー制約**: 参照整合性による data integrity 担保
- **一意制約**: ビジネスルールを DB 層で強制
- **論理削除**: 重要データの物理削除回避
- **UUID 採用**: 分散環境での一意性確保
- **型安全性**: 共有型定義（shared/types/）との連携

### 1.3 モノレポ構成での位置づけ

#### Prisma スキーマとの関係

```typescript
// apps/backend/src/prisma/schema.prisma
// このデータベース設計書を基に作成されるPrismaスキーマ
model Person {
  id        String   @id @default(uuid())
  name      String?
  // ...その他フィールド
}

// Prismaから自動生成される型定義が共有される
// shared/types/ ではなく、Prisma生成型をそのまま使用
```

#### 保守性の担保

- **スキーマ変更**: Prisma migrate による段階的更新
- **型安全性**: Prisma クライアントから自動生成される型を利用
- **一元管理**: データベース設計書 → Prisma スキーマ → 型定義の一方向フロー

## 2. 命名規則

### 2.1 全般の命名規則

#### 基本原則

- **大文字を使用しない**: 全て小文字で統一
- **複数単語の連携**: スネークケース（snake_case）を使用
- **言語**: 基本的にはローマ字ではなく、英語で命名
- **可読性**: 略語より完全な単語を優先

#### 例

```sql
-- ✅ 良い例
user_profile, birth_date, created_at

-- ❌ 悪い例
UserProfile, birthDate, createdAt  -- 大文字・キャメルケース
tanjyoubi, sakusei_bi              -- ローマ字
usr_prof, birth_dt                 -- 略語
```

### 2.2 テーブル名命名規則

#### 基本形式

- **単体テーブル**: 複数形の名詞（snake_case）
- **例**: `people`, `relationships`, `users`

#### n:n 関係テーブル

- **形式**: **〜s（複数形）** + "\_" + **〜s（複数形）**
- **例**: `users_people`, `people_tags`, `groups_permissions`
- **理由**: 関係する両テーブルが明確に表現される

```sql
-- ✅ 良い例
CREATE TABLE users_people (
  user_id VARCHAR(36),
  person_id VARCHAR(36)
);

-- ❌ 悪い例
CREATE TABLE user_person (     -- 単数形
  user_id VARCHAR(36),
  person_id VARCHAR(36)
);
```

### 2.3 カラム名命名規則

#### 基本原則

- **形式**: snake_case
- **状態表現**: ある瞬間の状態（ステータス）を表す名前とする
- **略名禁止**: flg/kbn などの略名は利用しない

#### 必須カラム

```sql
-- 以下のカラムは必須
id VARCHAR(36) PRIMARY KEY,           -- 主キー（UUID）
created_at DATETIME(3) NOT NULL,      -- 作成日時
updated_at DATETIME(3) NOT NULL       -- 更新日時
```

#### 外部キー

- **形式**: **テーブル名（単数形）\_id**
- **例**: `user_id`, `person_id`, `parent_id`

```sql
-- ✅ 良い例
parent_id VARCHAR(36),    -- people テーブルの id を参照
user_id VARCHAR(36)       -- users テーブルの id を参照

-- ❌ 悪い例
parents_id VARCHAR(36),   -- 複数形
parentId VARCHAR(36)      -- キャメルケース
```

#### 時間カラム

- **形式**: **受動態\_on**（日付のみ）、**受動態\_at**（日時）
- **例**: `created_at`, `updated_at`, `deleted_at`, `published_on`

```sql
-- ✅ 良い例
created_at DATETIME(3),     -- 作成された日時
published_on DATE,          -- 公開された日
verified_at DATETIME(3)     -- 認証された日時

-- ❌ 悪い例
create_time DATETIME(3),    -- 動詞形
creation_date DATE          -- 名詞形
```

#### フラグ・ステータス

- **ENUM 型は使用しない**: tinyint を使用
- **命名**: is_xxx, has_xxx の形式、または状態を表す名詞

```sql
-- ✅ 良い例
is_active TINYINT(1) DEFAULT 1,        -- アクティブフラグ
status TINYINT DEFAULT 0,               -- ステータス（0:無効, 1:有効, 2:削除済み）
email_verified TINYINT(1) DEFAULT 0    -- メール認証済みフラグ

-- ❌ 悪い例
active_flg TINYINT(1),                 -- flgは略語
gender ENUM('MALE', 'FEMALE')          -- ENUM型使用
```

### 2.4 インデックス名

- **形式**: `idx_{テーブル名}_{カラム名}`
- **例**: `idx_people_name`, `idx_relationships_parent_id`
- **複合**: `idx_people_gender_birth_date`

### 2.5 制約名

- **一意制約**: `uk_{テーブル名}_{カラム名}`
- **外部キー**: `fk_{参照元テーブル}_{参照先テーブル}_{カラム}`
- **チェック制約**: `chk_{テーブル名}_{制約内容}`

## 3. テーブル・カラム追加時の注意点

### 3.1 データ型選択ガイド

#### 文字列型

```sql
-- ID（UUID）
id VARCHAR(36) PRIMARY KEY

-- 短い文字列（名前、タイトル等）
name VARCHAR(100),
title VARCHAR(255)

-- 長い文字列（説明、メモ等）
memo TEXT,
description LONGTEXT

-- 固定長（コード等）
country_code CHAR(2)  -- ISO国家コード等
```

#### 数値型

```sql
-- フラグ・ステータス
is_active TINYINT(1) DEFAULT 1,
status TINYINT DEFAULT 0

-- 整数
age TINYINT UNSIGNED,        -- 0-255
count INT UNSIGNED,          -- 0-4,294,967,295
large_number BIGINT          -- 非常に大きな数値

-- 小数
price DECIMAL(10,2),         -- 金額（10桁、小数点以下2桁）
rate FLOAT                   -- 割合・比率
```

#### 日時型

```sql
-- 日付のみ
birth_date DATE,
published_on DATE

-- 日時（マイクロ秒まで）
created_at DATETIME(3),
updated_at DATETIME(3)

-- タイムスタンプ（自動更新）
modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

#### フラグ・ステータスの定数定義

```sql
-- フラグの場合
is_active TINYINT(1) DEFAULT 1  -- 0:無効, 1:有効

-- ステータスの場合（複数状態）
status TINYINT DEFAULT 0
-- 0:下書き, 1:公開, 2:削除済み, 3:非公開
```

### 3.2 カラム追加時のベストプラクティス

#### 新規カラム追加

```sql
-- ✅ 良い例：デフォルト値設定で既存データ影響なし
ALTER TABLE people
ADD COLUMN nickname VARCHAR(50) NULL DEFAULT NULL;

-- ✅ 良い例：NOT NULL制約も既存データに配慮
ALTER TABLE people
ADD COLUMN display_order INT UNSIGNED NOT NULL DEFAULT 0;
```

#### インデックス追加

```sql
-- 検索頻度の高いカラムにはインデックス追加
CREATE INDEX idx_people_nickname ON people(nickname);

-- 複合インデックスは使用頻度を考慮
CREATE INDEX idx_people_status_created_at ON people(status, created_at);
```

### 3.3 テーブル追加時の考慮点

#### 必須カラムの確認

```sql
CREATE TABLE new_table (
  id VARCHAR(36) PRIMARY KEY COMMENT 'ID（UUID）',
  -- ビジネスカラム
  name VARCHAR(100) NOT NULL COMMENT '名前',
  status TINYINT DEFAULT 1 COMMENT 'ステータス（0:無効, 1:有効）',
  -- 必須の管理カラム
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '作成日時',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新日時'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='テーブル説明';
```

#### 外部キー設定

```sql
-- 参照整合性の確保
CONSTRAINT fk_new_table_people_person
  FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE
```

### 3.4 パフォーマンス考慮事項

#### インデックス戦略

- **検索条件**: WHERE 句で使用するカラム
- **並び順**: ORDER BY 句で使用するカラム
- **結合条件**: JOIN 句で使用するカラム

#### 例

```sql
-- よく使用される検索パターンに合わせたインデックス
CREATE INDEX idx_people_status_birth_date ON people(status, birth_date);
CREATE INDEX idx_relationships_parent_type ON relationships(parent_id, type);
```

## 3. テーブル設計

### 3.1 people（人物）テーブル

#### 設計方針

- **全フィールド任意**: 無名人物・情報不足への対応
- **柔軟なデータ格納**: 段階的な情報蓄積を想定

```sql
CREATE TABLE people (
  id VARCHAR(36) PRIMARY KEY COMMENT '人物ID（UUID）',
  name VARCHAR(100) NULL COMMENT '氏名（任意）',
  gender TINYINT NULL COMMENT '性別（0:不明, 1:男性, 2:女性）',
  birth_date DATE NULL COMMENT '生年月日',
  death_date DATE NULL COMMENT '没年月日',
  birth_place VARCHAR(200) NULL COMMENT '出生地',
  photo VARCHAR(500) NULL COMMENT '写真URL',
  memo TEXT NULL COMMENT 'メモ・エピソード',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '作成日時',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新日時',

  -- インデックス（検索性能向上）
  INDEX idx_people_name (name),
  INDEX idx_people_birth_date (birth_date),
  INDEX idx_people_birth_place (birth_place),
  INDEX idx_people_gender (gender),
  INDEX idx_people_created_at (created_at),

  -- 制約
  CONSTRAINT chk_people_death_after_birth
    CHECK (death_date IS NULL OR birth_date IS NULL OR death_date >= birth_date),
  CONSTRAINT chk_people_gender
    CHECK (gender IS NULL OR gender IN (0, 1, 2))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='人物情報';
```

**フィールド詳細**
| フィールド | 型 | NULL | デフォルト | 説明 | 保守性への配慮 |
|-----------|----|----|----------|------|---------------|
| id | VARCHAR(36) | NO | UUID | 主キー | グローバル一意性 |
| name | VARCHAR(100) | YES | NULL | 氏名 | 無名人物対応 |
| gender | TINYINT | YES | NULL | 性別（0:不明, 1:男性, 2:女性） | 将来的な拡張可能性 |
| birth_date | DATE | YES | NULL | 生年月日 | 不明日付の許容 |
| death_date | DATE | YES | NULL | 没年月日 | 生存者への配慮 |
| birth_place | VARCHAR(200) | YES | NULL | 出生地 | 地名変更への対応 |
| photo | VARCHAR(500) | YES | NULL | 写真 URL | 外部ストレージ対応 |
| memo | TEXT | YES | NULL | メモ | 自由形式データ格納 |
| created_at | DATETIME(3) | NO | NOW() | 作成日時 | 監査ログ |
| updated_at | DATETIME(3) | NO | NOW() | 更新日時 | 変更追跡 |

### 3.2 relationships（関係）テーブル

#### 設計方針

- **親子関係の明確化**: 一方向の関係性定義
- **関係タイプの拡張性**: 生物学的・法的関係の区別

```sql
CREATE TABLE relationships (
  id VARCHAR(36) PRIMARY KEY COMMENT '関係ID（UUID）',
  parent_id VARCHAR(36) NOT NULL COMMENT '親のID',
  child_id VARCHAR(36) NOT NULL COMMENT '子のID',
  type TINYINT NOT NULL DEFAULT 1 COMMENT '関係タイプ（1:生物学的, 2:養子縁組）',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '作成日時',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新日時',

  -- 外部キー制約（カスケード削除）
  CONSTRAINT fk_relationships_people_parent
    FOREIGN KEY (parent_id) REFERENCES people(id) ON DELETE CASCADE,
  CONSTRAINT fk_relationships_people_child
    FOREIGN KEY (child_id) REFERENCES people(id) ON DELETE CASCADE,

  -- インデックス
  INDEX idx_relationships_parent_id (parent_id),
  INDEX idx_relationships_child_id (child_id),
  INDEX idx_relationships_type (type),
  INDEX idx_relationships_parent_child (parent_id, child_id),

  -- 制約
  CONSTRAINT uk_relationships_parent_child UNIQUE (parent_id, child_id),
  CONSTRAINT chk_relationships_no_self_reference CHECK (parent_id != child_id),
  CONSTRAINT chk_relationships_type CHECK (type IN (1, 2))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='親子関係';
```

**フィールド詳細**
| フィールド | 型 | NULL | デフォルト | 説明 | 保守性への配慮 |
|-----------|----|----|----------|------|---------------|
| id | VARCHAR(36) | NO | UUID | 主キー | グローバル一意性 |
| parent_id | VARCHAR(36) | NO | - | 親の ID | 外部キー制約 |
| child_id | VARCHAR(36) | NO | - | 子の ID | 外部キー制約 |
| type | TINYINT | NO | 1 | 関係タイプ（1:生物学的, 2:養子縁組） | 将来的な種別追加 |
| created_at | DATETIME(3) | NO | NOW() | 作成日時 | 監査ログ |
| updated_at | DATETIME(3) | NO | NOW() | 更新日時 | 変更追跡 |

### 3.3 users（ユーザー）テーブル（Phase 2）

#### 設計方針

- **認証情報の分離**: 人物データとの疎結合
- **拡張性**: 将来的な認証方式変更への対応

```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY COMMENT 'ユーザーID（UUID）',
  email VARCHAR(255) NOT NULL COMMENT 'メールアドレス',
  password_hash VARCHAR(255) NOT NULL COMMENT 'パスワードハッシュ',
  name VARCHAR(100) NOT NULL COMMENT 'ユーザー名',
  email_verified TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'メール認証状態（0:未認証, 1:認証済み）',
  is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'アクティブ状態（0:無効, 1:有効）',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '作成日時',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新日時',
  last_logged_in_at DATETIME(3) NULL COMMENT '最終ログイン日時',

  -- インデックス
  INDEX idx_users_email (email),
  INDEX idx_users_created_at (created_at),
  INDEX idx_users_is_active (is_active),

  -- 制約
  CONSTRAINT uk_users_email UNIQUE (email),
  CONSTRAINT chk_users_email_verified CHECK (email_verified IN (0, 1)),
  CONSTRAINT chk_users_is_active CHECK (is_active IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ユーザー認証情報';
```

## 4. 関係性設計

### 4.1 テーブル間関係

#### people ↔ relationships

- **1 対多関係**: 1 人の人物は複数の親子関係を持つ
- **自己参照**: 同一テーブル内での関係性表現
- **カスケード削除**: 人物削除時の関連関係自動削除

#### users ↔ people（Phase 2）

- **1 対多関係**: 1 ユーザーが複数の人物データを管理
- **任意関係**: 人物データのユーザー紐付けは任意

### 4.2 参照整合性

#### 制約レベル

- **DB 制約**: 基本的な整合性（外部キー、一意制約）
- **アプリ制約**: 複雑なビジネスルール（循環参照チェック）

#### 保守性の考慮

```typescript
// 循環参照チェックはアプリケーション層で実装
// apps/backend/src/services/relationshipService.ts
export async function validateRelationship(
  parentId: string,
  childId: string,
): Promise<void> {
  // 複雑なビジネスロジックの実装
}
```

## 5. データマイグレーション戦略

### 5.1 Prisma マイグレーション管理

#### ファイル配置

```
apps/backend/src/prisma/
├── schema.prisma              # スキーマ定義
├── migrations/                # マイグレーション履歴
│   ├── 20240101000000_init/   # 初期作成
│   └── migration.sql
└── seed.ts                    # 初期データ投入
```

#### マイグレーション命名規則

##### 基本形式

`{アクション}_{対象}_{詳細説明}`

##### アクション一覧

- **CreateTable**  
  テーブルの作成  
  例: `CreateTable_Users`

- **Add**  
  カラムやインデックスの追加  
  例: `Add_EmailToUsers`

- **Remove / Drop**  
  カラムやインデックスの削除  
  例: `Drop_EmailFromUsers`

- **Rename**  
  カラムやテーブル名の変更  
  例: `Rename_UsersToCustomers`

- **Alter**  
  カラムのデータ型変更、制約の変更  
  例: `Alter_EmailInUsers`

- **Insert**  
  データの挿入（特定の初期データなど）  
  例: `Insert_InitialRoles`

- **Delete**  
  データの削除  
  例: `Delete_ObsoleteDataFromUsers`

- **Update**  
  データの更新  
  例: `Update_StatusInOrders`

- **CreateIndex**  
  インデックスの作成  
  例: `CreateIndex_Users_Email`

- **DropIndex**  
  インデックスの削除  
  例: `DropIndex_Users_Email`

##### 対象一覧

- **Table 名**  
  操作対象となるテーブル名  
  例: `UsersTable`, `OrdersTable`

- **Column 名**  
  操作対象となるカラム名  
  例: `Email`, `Status`

- **Index 名**  
  操作対象となるインデックス名  
  例: `EmailIndex`, `UniqueKey`

#### 段階的スキーマ変更

```bash
# 開発環境でのマイグレーション作成
cd apps/backend
npx prisma migrate dev --name Add_NicknameToUsers

# 注意: 本番環境でのマイグレーション適用は慎重に検討すること
# 自動適用ではなく、手動での段階的な変更を推奨
```

### 5.2 データ整合性の担保

#### 制約の段階的追加

1. **Phase 1**: 基本制約（NOT NULL、UNIQUE）
2. **Phase 2**: 外部キー制約
3. **Phase 3**: 複雑なチェック制約

#### バックワード互換性

- 既存データへの影響を最小限に抑制
- 段階的な制約追加による安全な移行

## 6. 型定義との連携

### 6.1 Prisma から生成される型定義

#### 自動生成される型

```typescript
// Prismaクライアントから自動生成される型定義
import { Person, Relationship, User } from '@prisma/client'

// アプリケーションで使用する型
export type PersonWithRelations = Person & {
  parentRelationships: (Relationship & { parent: Person })[]
  childRelationships: (Relationship & { child: Person })[]
}
```

### 6.2 型安全性の確保

#### Prisma → TypeScript 型生成

```typescript
// Prismaクライアントから自動生成される型
import { Person, Relationship } from '@prisma/client'

// 型の一元管理により保守性確保
type CreatePersonInput = Omit<Person, 'id' | 'createdAt' | 'updatedAt'>
type UpdatePersonInput = Partial<CreatePersonInput>
```

## 7. 保守性の担保

### 7.1 設計レビューポイント

#### スキーマ変更時のチェック項目

- [ ] 既存データへの影響評価
- [ ] インデックス戦略の見直し
- [ ] 型定義との同期確認
- [ ] マイグレーション手順の検証

#### 継続的な品質確保

- **自動テスト**: スキーマ変更のリグレッションテスト
- **型チェック**: Prisma 生成型と共有型の整合性検証
- **パフォーマンステスト**: 大量データでの動作確認

### 7.2 ドキュメントの更新

#### 変更管理プロセス

1. **設計書更新**: このドキュメントの先行更新
2. **スキーマ実装**: Prisma スキーマの変更
3. **型定義同期**: 共有型定義の更新
4. **レビュー**: 関係者による変更内容確認

---

**重要**: このデータベース設計は**保守性**を最優先に設計されています。スキーマ変更時は必ず既存データへの影響を評価し、段階的な移行戦略を策定してください。
