最優先かつ未アサインのissueを自動選択して処理し、ブランチ作成からPR作成まで自動化するコマンドです。
引数なしで実行すると自動的に最優先のissueを選択し、引数でissue番号を指定することも可能です。

## 実行例

```bash
# 最優先かつ未アサインのissueを自動選択して処理
process-issue

# 特定のissue番号を指定して処理
process-issue 123
```

## 優先度の決定方法

以下の条件で最優先のissueを自動選択します：

### 1. **対象issueの条件**

- **状態**: Open（未クローズ）
- **アサイン**: 未アサイン（assignees が空）
- **優先度**: タイトルに `[数字]` 形式で指定

### 2. **選択順序**

1. **タイトルの `[数字]` で昇順ソート** (小さい数字 = 高優先度)
   - 例: `[1] バグ修正` > `[2] 機能追加` > `[10] ドキュメント更新`
2. **数字なしのissueは最低優先度**として扱う
3. **同じ優先度数字の場合はissue番号昇順**

### 3. **スキップされるissue**

- すでに誰かにアサインされているissue
- クローズ済みのissue

## 処理フロー

以下の手順で自動実行されます：

1. **最優先Issue の自動選択**（引数なしの場合）
   - 未アサインのOpen issueを一覧取得

   ```bash
   gh issue list --state open --assignee "" --json number,title,labels --limit 100
   ```

   - タイトルの `[数字]` による優先度ソート
   - 最優先issueを自動選択

2. **Issue情報の取得と確認**
   - 選択または指定されたissue番号の詳細を GitHub CLI で取得

   ```bash
   gh issue view [issue番号]
   ```

   - issue の タイトル、本文、ラベル を表示して確認

3. **Issueアサイン**
   - 選択されたissueを自分（現在のGitHubユーザー）にアサイン
   - `gh issue edit [issue番号] --add-assignee @me`

4. **Git準備作業**
   - リモートから最新の変更を pull
   - issue番号とタイトルから適切なブランチ名を生成
   - mainブランチを基に新しいブランチを作成
   - 新しいブランチ用の別ディレクトリ（worktree）を作成
   - worktree用の.env設定ファイルを自動生成
   - VS Codeの新規タブでそのworktreeディレクトリを開く
   - Claude Code用プロンプトテンプレートを画面出力

   **詳細手順**:

   ```bash
   # 1. 最新の変更を取得
   git fetch origin
   git pull origin main

   # 2. ブランチ名生成とworktree作成
   WORKTREE_PATH="../[Labels]/[issue番号]-[タイトルスラッグ]"
   BRANCH_NAME="[Labels]/[issue番号]-[タイトルスラッグ]"
   git worktree add "$WORKTREE_PATH" -b "$BRANCH_NAME" main

   # 3. worktree用.env設定の自動生成
   ISSUE_NUMBER=[issue番号]
   BRANCH_TYPE=[Labels]
   APP_PORT=$((3000 + ($ISSUE_NUMBER % 100)))
   API_PORT=$((4000 + ($ISSUE_NUMBER % 100)))
   DB_NAME="family_tree_${BRANCH_TYPE}_${ISSUE_NUMBER}"
   APP_NAME="app-${BRANCH_TYPE}-${ISSUE_NUMBER}"
   JWT_SECRET="worktree_jwt_${ISSUE_NUMBER}_$(date +%s)"
   COMPOSE_PROJECT_NAME="family-tree-${BRANCH_TYPE}-${ISSUE_NUMBER}"

   # .env.exampleから.envを作成し、プレースホルダーを置換
   cp .env.example "$WORKTREE_PATH/.env"
   sed -i "s|{{WORKTREE_PATH}}|$WORKTREE_PATH|g" "$WORKTREE_PATH/.env"
   sed -i "s|{{BRANCH_NAME}}|$BRANCH_NAME|g" "$WORKTREE_PATH/.env"
   sed -i "s|{{ISSUE_NUMBER}}|$ISSUE_NUMBER|g" "$WORKTREE_PATH/.env"
   sed -i "s|{{APP_PORT}}|$APP_PORT|g" "$WORKTREE_PATH/.env"
   sed -i "s|{{API_PORT}}|$API_PORT|g" "$WORKTREE_PATH/.env"
   sed -i "s|{{DB_NAME}}|$DB_NAME|g" "$WORKTREE_PATH/.env"
   sed -i "s|{{APP_NAME}}|$APP_NAME|g" "$WORKTREE_PATH/.env"
   sed -i "s|{{JWT_SECRET}}|$JWT_SECRET|g" "$WORKTREE_PATH/.env"
   sed -i "s|{{COMPOSE_PROJECT_NAME}}|$COMPOSE_PROJECT_NAME|g" "$WORKTREE_PATH/.env"

   # 4. VS Codeで新しいworktreeを開く
   code "$WORKTREE_PATH"

   # 5. Claude Code用プロンプトテンプレートを出力
   echo "========================================================================================"
   echo "🚀 新しいworktreeが作成されました！"
   echo "========================================================================================"
   echo ""
   echo "📁 Worktree Path: $WORKTREE_PATH"
   echo "🌿 Branch: $BRANCH_NAME"
   echo "🔢 Issue: #$ISSUE_NUMBER"
   echo "🌐 Frontend: http://localhost:$APP_PORT"
   echo "⚡ API: http://localhost:$API_PORT"
   echo ""
   echo "========================================================================================"
   echo "📋 Claude Code用プロンプト（コピー&ペーストしてください）"
   echo "========================================================================================"
   echo ""
   cat << 'TEMPLATE'
   このworktreeでissue #${ISSUE_NUMBER}の開発を開始します。
   ```

【Issue情報】

- タイトル: ${ISSUE_TITLE}
- ブランチ: ${BRANCH_NAME}
- 環境: 独立したDocker環境

【次に実行してください】

- issueの要件を分析し、実装計画をTodoWriteで作成
- 技術仕様はdocs/内のドキュメントに従って実装
- テスト駆動開発で品質を確保

このworktreeは完全に独立した環境なので、メインブランチや他のissueに影響しません。
TEMPLATE

# 実際の値でプレースホルダーを置換して出力

sed "s/\${ISSUE_NUMBER}/$ISSUE_NUMBER/g; s/\${ISSUE_TITLE}/$(echo "$ISSUE_TITLE" | sed 's/[[\]*^$()+{}|\\]/\\&/g')/g; s/\${BRANCH_NAME}/$BRANCH_NAME/g; s/\${APP_PORT}/$APP_PORT/g; s/\${API_PORT}/$API_PORT/g" << 'TEMPLATE'
このworktreeでissue #${ISSUE_NUMBER}の開発を開始します。

【Issue情報】

- タイトル: ${ISSUE_TITLE}
- ブランチ: ${BRANCH_NAME}
- 環境: Monorepo(frontend/backend/shared) + 独立Docker環境（ポート競合なし）

【CRITICAL: 必須セットアップ手順（Docker強制実行）】
以下を**必ず順番通り**に実行してください。ローカル実行は絶対禁止です。

1. **Docker環境とテストDB起動確認**:

   ```bash
   # Docker環境起動
   docker-compose --profile development up -d

   # 起動状況確認
   docker-compose ps
   ```

2. **アクセス確認**:
   - Frontend: http://localhost:${APP_PORT}
   - API: http://localhost:${API_PORT}

【品質チェック（実装前後で必須実行）】

```bash
# backendチェック
npm run docker:quality:backend

# frontendチェック
npm run docker:quality:frontend

# テスト実行
npm run docker:test:unit
npm run docker:test:integration
```

【CRITICAL: 実装ワークフロー（必須）】

1. **要件分析**: issueの内容を分析し、TodoWriteで実装計画を作成
2. **ドキュメント参照**: docs/ 内の技術仕様に厳密に従う
3. **テスト駆動開発**: テストファーストで品質確保
4. **段階的実装**: 小さく実装→テスト→コミットのサイクル
5. **品質チェック**: 全品質チェックコマンドが成功することを確認

このworktreeは完全に独立した環境です。メインブランチや他のissueに影響しません。
上記の手順を厳密に守って開発を進めてください。
TEMPLATE

echo ""
echo "========================================================================================"
echo "✅ 上記のプロンプトをコピーして、新しいVSCodeのClaude Codeに貼り付けてください"
echo "========================================================================================"

```

```
