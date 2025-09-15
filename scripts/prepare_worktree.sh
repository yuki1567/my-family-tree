#!/bin/bash
set -euo pipefail

# ========================================
# ログ関数
# ========================================
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"
}

log_error() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] ❌ ERROR: $*" >&2
}

# ========================================
# Issue選択とアサイン
# ========================================
fetch_issue() {
  log "📌 未アサインの優先度付きIssueを取得中..."
  
  local issues_json
  issues_json=$(gh issue list --state open --json number,title,labels,assignees --limit 100)

  local local unassigned_issues
  unassigned_issues=$(echo "$issues_json" | jq 'map(select(.assignees | length == 0))')

  local priority_issues
  priority_issues=$(echo "$unassigned_issues" | jq '
    map({
      number: .number,
      title: .title,
      priority: (.title | if test("\\[[0-9]+\\]") then (match("\\[([0-9]+)\\]").captures[0].string | tonumber) else 9999 end),
      labels: (.labels | .[0].name)
    })
  ')

  local selected_issue
  selected_issue=$(echo "$priority_issues" | jq 'sort_by(.priority) | first | {number, title, labels}')

  ISSUE_NUMBER=$(echo "$selected_issue" | jq -r '.number')
  ISSUE_TITLE=$(echo "$selected_issue" | jq -r '.title')
  ISSUE_LABELS=$(echo "$selected_issue" | jq -r '.labels')

  log "👤 選択されたIssue: #$ISSUE_NUMBER - $ISSUE_TITLE ($ISSUE_LABELS)"
  log "👤 Issue #$ISSUE_NUMBER を自分にアサイン中..."
  gh issue edit "$ISSUE_NUMBER" --add-assignee @me
}

generate_slug() {
  log "🌐 Google Cloud Translation APIでタイトルを英訳..."

  local TITLE_FOR_TRANSLATE

  TITLE_FOR_TRANSLATE=$(echo "$ISSUE_TITLE" | sed -E 's/^\[[0-9]+\]//')

  local google_translate_api_key

  google_translate_api_key="$(grep "^GOOGLE_TRANSLATE_API_KEY=" .env | cut -d'=' -f2)"

  local api_url="https://translation.googleapis.com/language/translate/v2"
  local response http_status translated

  response=$(curl -s -X POST "$api_url?key=$google_translate_api_key" \
    -H "Content-Type: application/json" \
    -d "{
    \"q\": \"$TITLE_FOR_TRANSLATE\",
    \"source\": \"ja\",
    \"target\": \"en\"
  }")

  http_status=$(echo "$response" | jq -r '.error.code // 200')

  if [ "$http_status" -ne 200 ]; then
    error_message=$(echo "$response" | jq -r '.error.message')
    log_error "APIリクエスト失敗 (HTTP $http_status): $error_message"
    exit 1
  fi

  translated=$(echo "$response" | jq -r '.data.translations[0].translatedText')

  # [数字]を削除してkebab-case化
  ISSUE_SLUG_TITLE=$(echo "$translated" | sed -E 's/\[[0-9]+\]//g' \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9]+/-/g' \
    | sed -E 's/^-|-$//g')

  log "✔ スラッグ生成: $ISSUE_SLUG_TITLE"
}

# ========================================
# Git準備とWorktree作成
# ========================================
prepare_worktree() {
  log "📂 Git Worktreeを準備中..."
  git fetch origin
  git pull origin main

  BRANCH_NAME="$ISSUE_LABELS/$ISSUE_NUMBER-$ISSUE_SLUG_TITLE"
  WORKTREE_PATH="../$BRANCH_NAME"

  log "🛠 Worktree作成: $WORKTREE_PATH, Branch: $BRANCH_NAME"
  git worktree add "$WORKTREE_PATH" -b "$BRANCH_NAME" main
}

# ========================================
# 環境設定ファイル生成
# ========================================
setup_env() {
  log "⚙ 環境設定中..."

  WEB_PORT=$((3000 + ($ISSUE_NUMBER % 100)))
  API_PORT=$((4000 + ($ISSUE_NUMBER % 100)))
  DB_NAME="family_tree_$(echo ${ISSUE_SLUG_TITLE} | sed 's/-/_/g')"
  APP_NAME="app-${ISSUE_SLUG_TITLE}"
  JWT_SECRET="worktree_jwt_${ISSUE_NUMBER}_$(date +%s)"

  cp .env.example "$WORKTREE_PATH/.env"
  cp .env.test "$WORKTREE_PATH/.env.test"
  cp .claude/settings.local.json "$WORKTREE_PATH/.claude/settings.local.json"

  sed -i "" "s#{{BRANCH_NAME}}#$BRANCH_NAME#g" "$WORKTREE_PATH/.env"
  sed -i "" "s#{{ISSUE_NUMBER}}#$ISSUE_NUMBER#g" "$WORKTREE_PATH/.env"
  sed -i "" "s#{{WEB_PORT}}#$WEB_PORT#g" "$WORKTREE_PATH/.env"
  sed -i "" "s#{{API_PORT}}#$API_PORT#g" "$WORKTREE_PATH/.env"
  sed -i "" "s#{{DB_NAME}}#$DB_NAME#g" "$WORKTREE_PATH/.env"
  sed -i "" "s#{{APP_NAME}}#$APP_NAME#g" "$WORKTREE_PATH/.env"
  sed -i "" "s#{{JWT_SECRET}}#$JWT_SECRET#g" "$WORKTREE_PATH/.env"
}

# ========================================
# DBスキーマ作成と権限付与
# ========================================
create_schema() {
  log "🗄 DBスキーマ作成中..."
  local mysql_root_password
  mysql_root_password="$(grep "^MYSQL_ROOT_PASSWORD=" .env | cut -d'=' -f2)"

  docker-compose exec db mysql -u root -p"${mysql_root_password}" -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;"
  
  docker-compose exec db mysql -u root -p"${mysql_root_password}" -e "GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER, INDEX ON \`${DB_NAME}\`.* TO 'family_tree_user'@'%';"
}

# ========================================
# VS Codeで新しいworktreeを開く
# ========================================
open_vscode() {
  log "💻 VS CodeでWorktreeを開く..."
  code "$WORKTREE_PATH"
}

# ========================================
# Claude Code用プロンプト生成
# ========================================
generate_prompt() {
  log "📝 Claude Code用プロンプト生成..."
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

  GENERATED_PROMPT=".claude/tmp/generated-worktree-prompt.md"
  sed "s|{{ISSUE_NUMBER}}|$ISSUE_NUMBER|g; \
       s|{{ISSUE_TITLE}}|$ISSUE_TITLE|g; \
       s|{{BRANCH_NAME}}|$BRANCH_NAME|g; \
       s|{{WEB_PORT}}|$WEB_PORT|g; \
       s|{{API_PORT}}|$API_PORT|g" \
       .claude/templates/worktree-prompt.md > "$GENERATED_PROMPT"

  echo "========================================================================================"
  echo "📋 完全プロンプト: $GENERATED_PROMPT"
  echo "   VS Codeで開いてClaude Codeに貼り付けてください"
  echo "========================================================================================"
}

# ========================================
# メイン処理
# ========================================
main() {
  fetch_issue
  generate_slug
  prepare_worktree
  setup_env
  create_schema
  open_vscode
  generate_prompt
}

main "$@"
