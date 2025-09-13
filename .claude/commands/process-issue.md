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

   # worktree用データベーススキーマを作成
   echo "📊 worktree用データベーススキーマを作成中..."
   docker-compose exec db mysql -u root -p${MYSQL_ROOT_PASSWORD} -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;" 2>/dev/null || echo "⚠️  DB作成をスキップ（DBコンテナが停止中の可能性）"

   # 必要最小限の権限のみ付与
   docker-compose exec db mysql -u root -p${MYSQL_ROOT_PASSWORD} -e "GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER, INDEX ON \`${DB_NAME}\`.* TO 'family_tree_user'@'%';" 2>/dev/null || echo "⚠️  権限付与をスキップ（DBコンテナが停止中の可能性）"

   # 4. VS Codeで新しいworktreeを開く
   code "$WORKTREE_PATH"

   # 5. Claude Code用プロンプトテンプレートを準備
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

   # 6. プロンプトテンプレートを処理して直接表示
   echo "========================================================================================"
   echo "📋 Claude Code用プロンプト（以下をコピー&ペーストしてください）"
   echo "========================================================================================"
   echo ""
   echo "\`\`\`"

   # テンプレートファイルから読み込み、変数を置換して直接出力
   # 区切り文字を|に変更してハイフンを含むブランチ名に対応
   sed "s|{{ISSUE_NUMBER}}|$ISSUE_NUMBER|g; s|{{ISSUE_TITLE}}|$ISSUE_TITLE|g; s|{{BRANCH_NAME}}|$BRANCH_NAME|g; s|{{APP_PORT}}|$APP_PORT|g; s|{{API_PORT}}|$API_PORT|g" .claude/templates/worktree-prompt.md

   echo "\`\`\`"
   echo ""
   echo "========================================================================================"
   echo "✅ 上記のプロンプトをコピーして、新しいVS CodeのClaude Codeに貼り付けてください"
   echo "========================================================================================"
   ```

```

## ⚠️ CRITICAL: process-issueコマンド完了チェック

**このコマンドの役割はここで終了です。**

### ✅ 完了済み項目の確認
- [ ] issue詳細の取得・確認
- [ ] issueのアサイン
- [ ] Git準備作業（fetch、pull、worktree作成）
- [ ] .env設定ファイルの生成
- [ ] VS Codeでworktree開く（`code`コマンド実行）
- [ ] プロンプトテンプレートの出力

### 🚫 実装作業は開始しない
**重要**: このClaude Codeでは**絶対に実装作業を開始しないでください**。
- Vitestの設定ファイル作成 ❌
- package.json修正 ❌
- その他のコード変更 ❌

### ✅ 次のステップ
1. 新しく開いたVS CodeのClaude Codeで上記のプロンプトを貼り付け
2. 新しい環境で実装作業を開始

**process-issueコマンドは環境準備のみが責任範囲です。**
```
