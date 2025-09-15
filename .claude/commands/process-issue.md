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
DB_NAME="family_tree_${ISSUE_SLUG_TITLE}"
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

# 4. Claude Code用プロンプトテンプレート表示
## テンプレートファイル: `.claude/templates/worktree-prompt.md`
## 4-1. Claude Code用プロンプトテンプレートを準備
echo "========================================================================================"
echo "🚀 新しいworktreeが作成されました！"
echo "========================================================================================"
echo ""
echo "📁 Worktree Path: $WORKTREE_PATH"
echo "🌿 Branch: $BRANCH_NAME"
echo "🔢 Issue: #$ISSUE_NUMBER"
echo "🌐 Frontend: http://localhost:$WEB_PORT"
echo "⚡ API: http://localhost:$API_PORT"
echo ""

## 4-2. プロンプトテンプレートを処理して直接表示
echo "========================================================================================"
echo "📋 Claude Code用プロンプト（以下をコピー&ペーストしてください）"
echo "========================================================================================"
echo ""
echo "\`\`\`"

### テンプレートファイルから読み込み、変数を置換して直接出力
### 区切り文字を|に変更してハイフンを含むブランチ名に対応
sed "s|{{ISSUE_NUMBER}}|$ISSUE_NUMBER|g; s|{{ISSUE_TITLE}}|$ISSUE_TITLE|g; s|{{BRANCH_NAME}}|$BRANCH_NAME|g; s|{{WEB_PORT}}|$WEB_PORT|g; s|{{API_PORT}}|$API_PORT|g" .claude/templates/worktree-prompt.md

echo "\`\`\`"
echo ""
echo "========================================================================================"
echo "✅ 上記のプロンプトをコピーして、新しいVS CodeのClaude Codeに貼り付けてください"
echo "========================================================================================"
```
