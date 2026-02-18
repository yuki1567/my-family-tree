このworktreeでissue #{{ISSUE_NUMBER}}の開発を開始します。

## 🚨 CRITICAL: 手順実行の厳格性 🚨

**このプロンプトの指示を絶対に無視せずに、TodoWriteで必須タスクを管理し、各ステップを順番通りに実行してください**

## Issue情報

- **タイトル**: {{ISSUE_TITLE}}
- **ブランチ**: {{BRANCH_NAME}}
- **AWS Profile**: {{AWS_PROFILE_NAME}}
- **Frontend**: http://localhost:{{WEB_PORT}}
- **API**: http://localhost:{{API_PORT}}

---

## 📋 実装ワークフロー（TodoWrite必須）

### ステップ1: 必須初期セットアップ

**実行前必須チェック:** まずTodoWriteで以下のタスクリストを作成してください：

```
TodoWrite必須タスク:
- [ ] Issue詳細確認（gh issue view {{ISSUE_NUMBER}}）
- [ ] 実装計画をissueコメントで事前説明
- [ ] Docker環境起動・確認
- [ ] 段階的実装（テスト含む）
- [ ] 品質チェック実行（4つのコマンド）
- [ ] コミット戦略実行（必須タイミング準拠）
- [ ] PR作成（ラベル付与必須）
- [ ] Codexコードレビュー実行・指摘対応
- [ ] IssueステータスをIn reviewに移動
- [ ] 受け入れ基準検証
```

#### 1.1 Issue詳細確認（必須）

```bash
gh issue view {{ISSUE_NUMBER}}
```

#### 1.2 実装計画コメント（必須）

```bash
gh issue comment {{ISSUE_NUMBER}} --body "## 実装計画

**技術選定理由**: [なぜこの手法を選んだか]
**実装手順**:
1. [ステップ1の詳細]
2. [ステップ2の詳細]
3. [テスト追加]

**コミット予定**:
- コンポーネント作成時
- テスト追加時
- ドキュメント更新時

実装を開始します。"
```

#### 1.3 Docker環境起動（強制実行）

```bash
# STEP1: 依存関係インストール（必須）
npm install

# STEP2: appsコンテナ起動（必須）
docker compose up -d apps

# STEP3: マイグレーション実行（必須）
npm run db:generate

# STEP4: 起動確認（必須）
docker compose ps

# STEP5: アクセス確認（必須）
echo "Frontend: http://localhost:{{WEB_PORT}}"
echo "API: http://localhost:{{API_PORT}}"
```

---

### ステップ2: 段階的コミット戦略（絶対遵守）

**コミット形式（厳格）**: `[prefix](#{{ISSUE_NUMBER}}): [内容]`

**必須コミットタイミング**:

1. ✅ **新しいファイル・コンポーネント作成時**
2. ✅ **テスト追加・修正時**
3. ✅ **ドキュメント更新時**
4. ✅ **バグ修正時**
5. ✅ **リファクタリング完了時**

**推奨単位**: テストと実装コードは**別コミット**

**例**:

```bash
# ファイル作成コミット
git add types/person.ts
git commit -m "add(#{{ISSUE_NUMBER}}): Person型定義ファイル作成"

# テストコミット
git add __tests__/types/person.test.ts
git commit -m "test(#{{ISSUE_NUMBER}}): Person型のテストケース追加"

# ドキュメントコミット
git add docs/technical/types.md
git commit -m "docs(#{{ISSUE_NUMBER}}): Person型仕様をドキュメント追加"
```

---

### ステップ3: 品質チェック（全コマンド実行必須）

**実行確認**: すべてのコマンドが**成功**することを確認

```bash
# 1. 品質チェック（必須）
npm run check

# 2. 型チェック（必須）
npm run type-check

# 3. フロントエンドテスト（必須）
npm run test:frontend

# 4. バックエンドテスト（必須）
npm run test:backend
```

**失敗時の対応**: エラーがある場合は修正→再実行→全通過まで繰り返し

---

### ステップ4: PR作成（厳格テンプレート）

#### 4.1 PRタイトル

```
{{ISSUE_TITLE}}
```

**（注: issueタイトルをそのまま使用）**

#### 4.2 PR作成コマンド（ラベル付与必須）

```bash
# ラベル確認（issueと同じラベル付与）
gh issue view {{ISSUE_NUMBER}} --json labels

# PR作成（テンプレート厳守）
gh pr create --title "{{ISSUE_TITLE}}" --label "{{ISSUE_LABEL}}" --body "$(cat <<'EOF'
## 概要
issue #{{ISSUE_NUMBER}}の要件を満たすため、以下の実装を行いました：
- [具体的に何を解決したか]
- [ユーザーにとってどのような価値を提供するか]
- [システム全体への影響や改善点]

## 実装内容

### 追加・変更したファイル
- [ファイル名]: [変更内容と理由]
- [ファイル名]: [変更内容と理由]

### 技術的判断と根拠
- **選択した技術・手法**: [具体的な技術名]
- **選択理由**: [なぜこの方法を選んだか、他の選択肢との比較]
- **既存システムとの整合性**: [既存コードとの一貫性確保方法]
- **将来への考慮**: [拡張性・保守性への配慮]

## テスト結果

### 品質チェック結果
- Backend品質チェック: ✅ 通過
- Frontend品質チェック: ✅ 通過
- Unit テスト: ✅ 通過
- Integration テスト: ✅ 通過

## 受け入れ基準チェックリスト

- [ ] [issue基準1]
- [ ] [issue基準2]
- [ ] [issue基準3]

Closes #{{ISSUE_NUMBER}}
EOF
)"
```

#### 4.3 Codexコードレビュー（必須）

PR作成後、Codex MCPを使用してコードレビューを実行する:

1. `/codex-review` スキルを実行してレビューを取得
2. 🔴（Must Fix）の指摘がある場合は修正してコミット → 再度品質チェック → PRを更新
3. 🟡（Should Fix）の指摘は可能な範囲で対応
4. レビュー結果をPRコメントとして記録

#### 4.4 IssueステータスをIn reviewに移動（必須）

**固定値**（プロジェクトで共通）:

- Project ID: `{{PROJECT_ID}}`
- StatusフィールドID: `{{STATUS_FIELD_ID}}`
- "In review"オプションID: `{{IN_REVIEW_STATUS_ID}}`

**実行手順**:

```bash
# STEP1: Project item IDを取得（issue番号{{ISSUE_NUMBER}}のアイテムID）
gh project item-list 1 --owner @me --format json --limit 100 | jq -r '.items[] | select(.content.number == {{ISSUE_NUMBER}}) | .id'
# → 出力されたIDをコピー（例: PVTI_****************）

# STEP2: Statusを"In review"に変更（STEP1で取得したIDを使用）
gh project item-edit \
  --id "<STEP1で取得したID>" \
  --project-id "{{PROJECT_ID}}" \
  --field-id "{{STATUS_FIELD_ID}}" \
  --single-select-option-id "{{IN_REVIEW_STATUS_ID}}"
```

**実行時の注意**:

- STEP1で取得したIDを、STEP2の`--id`パラメータに使用すること
- エラーが発生した場合は、STEP1から再実行すること

---

### ステップ5: 受け入れ基準検証（必須プロセス）

#### 5.1 各基準の詳細検証

```bash
# issue受け入れ基準の再確認
gh issue view {{ISSUE_NUMBER}}

# 基準ごとの検証実行
# 例: 基準1「Person型が正しく定義されている」
# → 実際にimportして型チェック確認
```

#### 5.2 検証結果の記録（詳細必須）

```bash
gh pr comment --body "✅ 受け入れ基準検証完了

**検証詳細**：
- [基準1]: ✅ 検証済み
  - 検証方法: [具体的な確認手順]
  - 結果: [OK/期待通りの動作確認]
  - 証跡: [スクリーンショット/ログ等]

**品質確認**：
- テスト結果: 全て通過
- 品質チェック: 全て通過

レビューをお願いします 🙏"
```

#### 5.3 チェックリスト更新（必須）

```bash
# issue側のチェックリスト更新
gh issue edit {{ISSUE_NUMBER}} --body "[更新された本文（チェック済みマーク追加）]"

# PR側のチェックリスト更新
gh pr edit --body "[更新されたPR本文（チェック完了）]"
```

---

## 🔴 失敗時の強制リカバリー手順

### コミット戦略違反時

```bash
# 不適切なコミットの修正
git reset --soft HEAD~1
git add [適切なファイル群]
git commit -m "[正しい形式](#{{ISSUE_NUMBER}}): [内容]"
```

### PR作成不備時

```bash
# PR削除→再作成
gh pr close [PR番号]
gh pr create [正しいテンプレート使用]
```

### 品質チェック失敗時

```bash
# エラー修正→再実行
[修正作業]
npm run docker:quality:backend
npm run docker:quality:frontend
npm run docker:test:unit
npm run docker:test:integration
```

---

## ✅ 完了確認チェックリスト

**このチェックリストをすべてクリアするまで作業完了とみなしません**:

- [ ] TodoWriteでタスク管理を実行した
- [ ] Issue詳細を確認し、実装計画をコメントした
- [ ] Docker環境を起動・確認した
- [ ] 段階的コミット戦略に従って適切にコミットした
- [ ] 4つの品質チェックコマンドすべてが成功した
- [ ] PRを正しいテンプレートで作成し、ラベルを付与した
- [ ] Codexコードレビューを実行し、必須指摘を対応した
- [ ] IssueステータスをIn reviewに移動した
- [ ] 受け入れ基準を詳細に検証し、結果を記録した
- [ ] issue・PRのチェックリストを更新した

---

**重要**: この手順を守らない場合、品質問題や要件未達のリスクが高まります。必ず順番通りに実行してください。
