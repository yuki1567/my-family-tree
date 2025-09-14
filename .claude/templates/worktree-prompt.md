このworktreeでissue #{{ISSUE_NUMBER}}の開発を開始します。

## Issue情報

- **タイトル**: {{ISSUE_TITLE}}
- **ブランチ**: {{BRANCH_NAME}}
- **Frontend**: http://localhost:{{WEB_PORT}}
- **API**: http://localhost:{{API_PORT}}

## 重要ドキュメント

- [開発ガイド](docs/03_development/01_getting_started.md)
- [コーディング規約](docs/03_development/02_coding_standards.md)
- [Git Workflow](docs/03_development/04_git_workflow.md)
- [Issue管理](docs/03_development/06_issue_management.md)

## 【CRITICAL: 必須セットアップ手順（Docker強制実行）】

- 以下を**必ず順番通り**に実行してください。ローカル実行は絶対禁止です。

### 1. 依存関係インストール

```bash
npm install
```

### 2. Docker環境起動

```bash
# 段階的起動（dbコンテナ競合回避）
# 1) dbコンテナが未起動の場合は全て起動
# 2) dbコンテナが起動している場合はappsコンテナのみ起動
if ! docker-compose ps db | grep -q "Up"; then
 echo "📦 dbコンテナが未起動のため、全サービスを起動します"
 docker-compose --profile development up -d
else
 echo "📦 既存dbコンテナを使用し、appsコンテナのみ起動します"
 docker-compose --profile development up -d --no-deps apps
fi

# 起動確認
docker-compose ps
```

### 3. アクセス確認

- Frontend: http://localhost:{{APP_PORT}}
- API: http://localhost:{{API_PORT}}

## 品質チェック

詳細は [コーディング規約](docs/03_development/02_coding_standards.md) を参照

```bash
npm run docker:quality:backend
npm run docker:quality:frontend
npm run docker:test:unit
npm run docker:test:integration
```

## 実装ワークフロー

1. **要件分析**: issueの内容を分析し、TodoWriteで実装計画を作成
2. **実装前説明**: 技術選定と実装方針をissueコメントで事前説明
3. **ドキュメント参照**: docs/ 内の技術仕様に厳密に従う
4. **段階的実装**: 小さく実装→テスト→コミットのサイクル
5. **受け入れ基準検証**: 実装完了後の厳密な要件チェック
6. **PR作成**: 詳細な技術判断根拠を含むPR作成
7. **品質チェック**: 全品質チェックコマンドが成功することを確認

## コミット・PR戦略

詳細は [Git Workflow](docs/03_development/04_git_workflow.md#コミット規約) を参照

**コミット形式**: `[prefix](#{{ISSUE_NUMBER}}): [内容]`

**例**:

```bash
git commit -m "add(#{{ISSUE_NUMBER}}): ユーザー作成API追加"
git commit -m "test(#{{ISSUE_NUMBER}}): APIテスト追加"
```

## 実装開始前の必須タスク

### 1. Issue詳細確認

```bash
gh issue view {{ISSUE_NUMBER}}
```

### 2. 実装計画コメント

```bash
gh issue comment {{ISSUE_NUMBER}} --body "## 実装計画

**技術選定**: [手法・理由]
**手順**: [1.ステップ1 2.ステップ2...]

実装を開始します。"
```

## 受け入れ基準検証

詳細は [Issue管理](docs/03_development/06_issue_management.md#受け入れ基準検証) を参照

### 各基準の検証・更新

1. 機能要件・技術要件を検証
2. issue・PRのチェックリストを更新
3. 未達成項目がある場合は追加実装

## 開発完了時のタスク

詳細は [Git Workflow](docs/03_development/04_git_workflow.md#pr-ワークフロー) を参照

### PR作成

```bash
gh pr create --title "{{ISSUE_TITLE}}" --body "$(cat <<'EOF'
## 概要
issue #{{ISSUE_NUMBER}} の実装

## 実装内容
[技術判断と根拠]

## テスト結果
[品質チェック結果]

## 受け入れ基準チェックリスト
- [ ] [基準1]
- [ ] [基準2]

Closes #{{ISSUE_NUMBER}}
EOF
)"
```

---

このworktreeは独立環境です。上記手順に従って開発を進めてください。
