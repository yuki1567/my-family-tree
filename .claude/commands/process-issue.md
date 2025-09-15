最優先かつ未アサインのissueを自動選択して処理し、worktree環境を準備し、Claude Codeのプロンプトテンプレートを表示するコマンドです。

## 処理フロー

```bash
# 1. Issue選択とアサイン
## 1-1. 未アサインissue取得
gh issue list --state open --json number,title,labels,assignees --limit 100 > temp_issues.json

## 1-2. 優先度付きissue抽出
jq -r '
  map(select(.assignees | length == 0))
  | map({
    number: .number,
    title: .title,
    priority: (.title |
      if test("\\[[0-9]+\\]") then
        (match("\\[([0-9]+)\\]").captures[0].string | tonumber)
      else 9999 end),
    labels: (.labels | .[0].name)})
  | sort_by(.priority)
  | first
  | {number, title, labels}
' temp_issues.json > selected_issue.json

## 1-3. 変数設定
ISSUE_NUMBER=$(jq -r '.number' selected_issue.json)
ISSUE_TITLE=$(jq -r '.title' selected_issue.json)
ISSUE_LABELS=$(jq -r '.labels' selected_issue.json)

## 1-4. アサイン実行
gh issue edit $ISSUE_NUMBER --add-assignee @me

## 1-5. 一時ファイル削除
rm temp_issues.json selected_issue.json

# 2. Git準備とWorktree作成

## 2-1. 最新の変更を取得
git fetch origin
git pull origin main

## 2-2. タイトルをスラッグ化
### Claude Code: このタイトルを英語に翻訳してkebab-case形式のスラッグに変換し、ISSUE_SLUG_TITLE変数に代入してください
### 例: '[1]認証機能のバグ修正' → 'fix-authentication-bug'
ISSUE_SLUG_TITLE=""

## 2-3. ブランチ名生成とworktree作成
WORKTREE_PATH="../$ISSUE_LABELS/$ISSUE_NUMBER-$ISSUE_SLUG_TITLE"
BRANCH_NAME="$ISSUE_LABELS/$ISSUE_NUMBER-$ISSUE_SLUG_TITLE"
git worktree add "$WORKTREE_PATH" -b "$BRANCH_NAME" main

# 3. 環境設定ファイル生成
WEB_PORT=$((3000 + ($ISSUE_NUMBER % 100)))
API_PORT=$((4000 + ($ISSUE_NUMBER % 100)))
DB_NAME="family_tree_$(echo ${ISSUE_SLUG_TITLE} | sed 's/-/_/g')"
APP_NAME="app-${ISSUE_SLUG_TITLE}"
JWT_SECRET="worktree_jwt_${ISSUE_NUMBER}_$(date +%s)"

cp .env.example "$WORKTREE_PATH/.env"
cp .env.test "$WORKTREE_PATH/.env.test"

sed -i "" "s#{{BRANCH_NAME}}#$BRANCH_NAME#g" "$WORKTREE_PATH/.env"
sed -i "" "s#{{ISSUE_NUMBER}}#$ISSUE_NUMBER#g" "$WORKTREE_PATH/.env"
sed -i "" "s#{{WEB_PORT}}#$WEB_PORT#g" "$WORKTREE_PATH/.env"
sed -i "" "s#{{API_PORT}}#$API_PORT#g" "$WORKTREE_PATH/.env"
sed -i "" "s#{{DB_NAME}}#$DB_NAME#g" "$WORKTREE_PATH/.env"
sed -i "" "s#{{APP_NAME}}#$APP_NAME#g" "$WORKTREE_PATH/.env"
sed -i "" "s#{{JWT_SECRET}}#$JWT_SECRET#g" "$WORKTREE_PATH/.env"

# 4. worktree用DBスキーマ作成と権限付与
docker-compose exec db mysql -u root -p${MYSQL_ROOT_PASSWORD} -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;"

docker-compose exec db mysql -u root -p${MYSQL_ROOT_PASSWORD} -e "GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER, INDEX ON \`${DB_NAME}\`.* TO 'family_tree_user'@'%';"

# 5. VS Codeで新しいworktreeを開く
code "$WORKTREE_PATH"

# 6. Claude Code用プロンプトテンプレート表示
## 6-1. 要約版を画面表示
echo "========================================================================================"
echo "🚀 Issue #$ISSUE_NUMBER の開発環境が準備完了"
echo "========================================================================================"
echo ""
echo "📁 Worktree Path: $WORKTREE_PATH"
echo "🌿 Branch: $BRANCH_NAME"
echo "🔢 Issue番号: #$ISSUE_NUMBER"
echo "📋 Issueタイトル: $ISSUE_TITLE"
echo "🌐 Frontend: http://localhost:$WEB_PORT"
echo "⚡ API: http://localhost:$API_PORT"
echo ""

## 6-2. 完全版を.claude/templates/内に保存（上書き）
GENERATED_PROMPT=".claude/templates/generated-worktree-prompt.md"
sed "s|{{ISSUE_NUMBER}}|$ISSUE_NUMBER|g; s|{{ISSUE_TITLE}}|$ISSUE_TITLE|g; s|{{BRANCH_NAME}}|$BRANCH_NAME|g; s|{{WEB_PORT}}|$WEB_PORT|g; s|{{API_PORT}}|$API_PORT|g" .claude/templates/worktree-prompt.md > "$GENERATED_PROMPT"

echo "========================================================================================"
echo "📋 完全プロンプト: $GENERATED_PROMPT"
echo "   VS Codeで開いてClaude Codeに貼り付けてください"
echo "========================================================================================"
```
