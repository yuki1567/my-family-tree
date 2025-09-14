# Git ワークフロー

## 概要

このプロジェクトでは、issue駆動開発とworktreeベースのワークフローを採用しています。
各issueに対して独立した開発環境を構築し、段階的なコミットとPR作成を通じて品質を担保します。

## ブランチ戦略

### メインブランチ

- `main`: 本番環境にデプロイ可能な安定版

### 開発ブランチ命名規則

```
[ラベル]/[issue番号]-[タイトルスラッグ]
```

**例**:

- `feature/123-user-authentication`
- `bug/456-login-error`
- `enhancement/789-improve-performance`

## コミット規約

### コミットメッセージ形式

```
[prefix](#issue番号): [実装内容の要約]
```

### コミットプレフィックス

| プレフィックス | 用途                     | 例                                                 |
| -------------- | ------------------------ | -------------------------------------------------- |
| `fix`          | 既存機能の問題修正       | `fix(#123): ログイン時のエラーハンドリング修正`    |
| `add`          | 新しいファイル・機能追加 | `add(#123): ユーザー作成APIエンドポイント追加`     |
| `feat`         | 新機能の実装             | `feat(#123): 二要素認証機能追加`                   |
| `delete`       | ファイル・機能削除       | `delete(#123): 未使用コンポーネント削除`           |
| `rename`       | ファイル名変更           | `rename(#123): User.vue を UserProfile.vue に変更` |
| `move`         | ファイル移動             | `move(#123): utils を shared/utils に移動`         |
| `revert`       | 以前のコミットに戻す     | `revert(#123): 前回のデータベース変更を戻す`       |
| `docs`         | ドキュメント修正         | `docs(#123): API仕様書更新`                        |
| `style`        | コーディングスタイル修正 | `style(#123): ESLint警告修正`                      |
| `test`         | テストコード関連         | `test(#123): ユーザー作成APIのテスト追加`          |

### 段階的コミット戦略

**必須コミットタイミング**:

1. 新しいファイル・コンポーネント作成時
2. テスト追加・修正時
3. ドキュメント更新時
4. バグ修正時
5. リファクタリング完了時

**推奨コミット単位**:

- 1つの論理的変更 = 1コミット
- 関連するファイル群は同じコミットに含める
- テストと実装コードは別コミット

### コミット例

```bash
# 実装コミット
git commit -m "add(#123): ユーザー作成APIエンドポイント追加"

# テストコミット
git commit -m "test(#123): ユーザー作成APIのテスト追加"

# ドキュメントコミット
git commit -m "docs(#123): API仕様書更新"
```

## Worktree ワークフロー

### Worktree作成

各issueに対して独立したworktreeを作成します

#### 処理実行フロー

```bash
# 1. 最新の変更を取得
git fetch origin
git pull origin main

# 2. ブランチ名生成とworktree作成
WORKTREE_PATH="../[Labels]/[issue番号]-[タイトルスラッグ]"
BRANCH_NAME="[Labels]/[issue番号]-[タイトルスラッグ]"
git worktree add "$WORKTREE_PATH" -b "$BRANCH_NAME" main

# 3. worktree用.env設定の自動生成
ISSUE_NUMBER="[issue番号]"
BRANCH_TYPE="[Labels]"
WEB_PORT=$((3000 + ($ISSUE_NUMBER % 100)))
API_PORT=$((4000 + ($ISSUE_NUMBER % 100)))
DB_NAME="family_tree_${BRANCH_TYPE}_${ISSUE_NUMBER}"
APP_NAME="app-${BRANCH_TYPE}-${ISSUE_NUMBER}"
JWT_SECRET="worktree_jwt_${ISSUE_NUMBER}_$(date +%s)"

# .env.exampleから.envを作成し、プレースホルダーを置換
cp .env.example "$WORKTREE_PATH/.env"
sed -i "s|{{BRANCH_NAME}}|$BRANCH_NAME|g" "$WORKTREE_PATH/.env"
sed -i "s|{{ISSUE_NUMBER}}|$ISSUE_NUMBER|g" "$WORKTREE_PATH/.env"
sed -i "s|{{WEB_PORT}}|$WEB_PORT|g" "$WORKTREE_PATH/.env"
sed -i "s|{{API_PORT}}|$API_PORT|g" "$WORKTREE_PATH/.env"
sed -i "s|{{DB_NAME}}|$DB_NAME|g" "$WORKTREE_PATH/.env"
sed -i "s|{{APP_NAME}}|$APP_NAME|g" "$WORKTREE_PATH/.env"
sed -i "s|{{JWT_SECRET}}|$JWT_SECRET|g" "$WORKTREE_PATH/.env"

# .env.testファイルもworktreeにコピー
cp .env.test "$WORKTREE_PATH/.env.test"

# worktree用データベーススキーマを作成
docker-compose exec db mysql -u root -p${MYSQL_ROOT_PASSWORD} -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;"

# 必要最小限の権限のみ付与
docker-compose exec db mysql -u root -p${MYSQL_ROOT_PASSWORD} -e "GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER, INDEX ON \`${DB_NAME}\`.* TO 'family_tree_user'@'%';"

# 4. VS Codeで新しいworktreeを開く
code "$WORKTREE_PATH"
```

### Worktree構造

```
../[ラベル]/[issue番号]-[タイトルスラッグ]/
├── .env                 # worktree固有の環境設定
├── .env.test           # テスト用環境設定
└── [プロジェクトファイル]
```

### 環境分離

- **ポート**: issue番号ベースで自動割り当て
- **データベース**: worktree専用スキーマ
- **Docker**: 独立したコンテナ名

## PR ワークフロー

### PR作成要件

#### タイトル

issueのタイトルをそのまま使用

#### 本文構成

1. 概要

- [具体的に何を解決したか]
- [ユーザーにとってどのような価値を提供するか]
- [システム全体への影響や改善点]

2. 実装内容

- 追加・変更したファイル
  - [ファイル名]: [変更内容と理由]
  - [ファイル名]: [変更内容と理由]

- 技術的判断と根拠
  - **選択した技術・手法**: [具体的な技術名]
  - **選択理由**: [なぜこの方法を選んだか、他の選択肢との比較]
  - **既存システムとの整合性**: [既存コードとの一貫性確保方法]
  - **将来への考慮**: [拡張性・保守性への配慮]

1. テスト結果

- テスト結果と品質チェックの結果

4. 受け入れ基準チェックリスト

- issue要件の検証

#### ラベル付与

issueと同じラベルを付与

### PR作成コマンド例

```bash
gh pr create --title "{{ISSUE_TITLE}}" --body "$(cat <<'EOF'
## 概要
issue #123の要件を満たすため、以下の実装を行いました：
- [具体的な解決内容]

## 実装内容
### 技術的判断と根拠
- **選択した技術**: [技術名]
- **選択理由**: [理由]

## テスト結果
[テスト実行結果]

## 受け入れ基準チェックリスト
- [ ] [基準1]
- [ ] [基準2]

Closes #123
EOF
)"
```

## 品質保証

### 必須チェック項目

- [ ] 全テストが通過
- [ ] ESLint/Prettierチェック通過
- [ ] TypeScript型チェック通過
- [ ] 受け入れ基準すべて満了

### 品質チェックコマンド

```bash
# backend品質チェック
npm run docker:quality:backend

# frontend品質チェック
npm run docker:quality:frontend

# テスト実行
npm run docker:test:unit
npm run docker:test:integration
```

## ベストプラクティス

### コミット

- 意味のある単位でコミットする
- コミットメッセージは具体的に書く
- 大きな変更は複数のコミットに分割する

### PR

- PRは小さく保つ（最大2-4時間の作業量）
- レビュワーが理解しやすいよう技術判断を明記
- 受け入れ基準を必ず検証する

### ブランチ管理

- 作業完了後は worktree を削除
- 長期間残るブランチは避ける
- main ブランチは常にデプロイ可能状態を維持
