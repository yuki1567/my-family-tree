#!/bin/bash
# ============================================
# post-merge: PRマージ後の後処理自動実行スクリプト
# 実行例: scripts/post-merge 123
# ============================================

set -euo pipefail

# --------------------------------------------
# ログ関数
# --------------------------------------------
log() { 
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"; 
}

log_error() { 
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] ❌ ERROR: $*" >&2; 
}

# --------------------------------------------
# 引数チェック
# --------------------------------------------
check_args() {
  ISSUE_NUMBER=${1:-}
  if [ -z "$ISSUE_NUMBER" ]; then
    log_error "issue番号を指定してください"
    exit 1
  fi
}

# --------------------------------------------
# ISSUE_NUMBER に対応するワークツリー情報取得
# --------------------------------------------
fetch_worktree_info() {
  WORKTREE_INFO=$(git worktree list | grep "/$ISSUE_NUMBER-") || true
  if [ -z "$WORKTREE_INFO" ]; then
    log_error "ISSUE_NUMBER=$ISSUE_NUMBER に対応するワークツリーが見つかりません"
    exit 1
  fi

  WORKTREE_PATH=$(echo "$WORKTREE_INFO" | awk '{print $1}')
  WORKTREE_BRANCH=$(echo "$WORKTREE_INFO" | awk '{print $3}' | tr -d '[]')

  log "🛠 Worktree Path: $WORKTREE_PATH"
  log "🛠 Branch Name: $WORKTREE_BRANCH"
}

# --------------------------------------------
# .env 読み込み
# --------------------------------------------
load_env() {
  ENV_FILE="$WORKTREE_PATH/.env"
  if [ ! -f "$ENV_FILE" ]; then
    log_error ".env ファイルが見つかりません: $ENV_FILE"
    exit 1
  fi

  # .envファイルをsourceで読み込み（ダブルクォート対応）
  set -a
  source "$ENV_FILE"
  set +a
}

# --------------------------------------------
# main 修正を取り込み
# --------------------------------------------
merge_into_main() {
  log "🔄 main に取り込み処理開始"

  git checkout main
  git pull origin main
  
  log "✅ main への取り込み完了"
}

# --------------------------------------------
# DB削除
# --------------------------------------------
remove_worktree_db() {
  if [ -z "${DB_NAME:-}" ]; then
    log_error "DB_NAME が設定されていません: $ENV_FILE"
    exit 1
  fi

  log "🗄 データベース削除: $DB_NAME"
  log "デバッグ: 実行コマンド = docker exec -e MYSQL_PWD=\"${MYSQL_ROOT_PASSWORD}\" db mysql -u root -e \"DROP DATABASE IF EXISTS \\\`${DB_NAME}\\\`;\""

  if ! docker exec -e MYSQL_PWD="${MYSQL_ROOT_PASSWORD}" db mysql -u root -e "DROP DATABASE IF EXISTS \`${DB_NAME}\`;"; then
    log_error "データベース削除に失敗しました: $DB_NAME"
    exit 1
  fi

  log "✅ データベース削除完了: $DB_NAME"
}

# --------------------------------------------
# コンテナ停止・削除・イメージ削除
# --------------------------------------------
remove_worktree_container() {
  if [ -z "${APP_NAME:-}" ]; then
    log "ℹ️ APP_NAME が.envに設定されていないため、コンテナ削除をスキップします"
    return
  fi

  log "🐳 Worktreeコンテナ処理開始: $APP_NAME"

  docker stop "$APP_NAME" 2>/dev/null && log "🛑 コンテナ停止: $APP_NAME" || log "ℹ️ コンテナは既に停止済み: $APP_NAME"
  docker rm "$APP_NAME" 2>/dev/null && log "🗑 コンテナ削除: $APP_NAME" || log "ℹ️ コンテナは既に存在しません: $APP_NAME"
  docker rmi "$APP_NAME" 2>/dev/null && log "🗑 イメージ削除: $APP_NAME" || log "ℹ️ イメージは既に存在しません: $APP_NAME"

  log "✅ Worktreeコンテナ削除完了: $APP_NAME"
}

# --------------------------------------------
# worktree削除
# --------------------------------------------
remove_worktree() {
  if [ ! -d "$WORKTREE_PATH" ]; then
    log_error "Worktree が存在しません: $WORKTREE_PATH"
    exit 1
  fi

  log "📂 Worktree削除: $WORKTREE_PATH"
  if ! git worktree remove "$WORKTREE_PATH"; then
    log_error "Worktree 削除に失敗しました: $WORKTREE_PATH"
    exit 1
  fi

  rm -rf "$WORKTREE_PATH" || { log_error "Worktree ディレクトリ削除に失敗しました: $WORKTREE_PATH"; exit 1; }
  log "✅ Worktree削除完了: $WORKTREE_PATH"
}

# --------------------------------------------
# ブランチ削除
# --------------------------------------------
remove_branch() {
  if git show-ref --verify --quiet "refs/heads/$WORKTREE_BRANCH"; then
    log "🗑 ローカルブランチ削除: $WORKTREE_BRANCH"
    git branch -d "$WORKTREE_BRANCH" || {
      log_error "ローカルブランチ削除に失敗しました: $WORKTREE_BRANCH"
      exit 1
    }
  else
    log "ℹ️ ローカルブランチは存在しません: $WORKTREE_BRANCH"
  fi

  if git ls-remote --exit-code --heads origin "$WORKTREE_BRANCH" >/dev/null 2>&1; then
    log "🗑 リモートブランチ削除: $WORKTREE_BRANCH"
    git push origin --delete "$WORKTREE_BRANCH" || {
      log_error "リモートブランチ削除に失敗しました: $WORKTREE_BRANCH"
      exit 1
    }
  else
    log "ℹ️ リモートブランチは既に存在しません: $WORKTREE_BRANCH"
  fi
}

# --------------------------------------------
# Issueクローズ
# --------------------------------------------
close_issue() {
  if gh issue view "$ISSUE_NUMBER" --json state -q ".state" | grep -q "CLOSED"; then
    log "ℹ️ Issue #$ISSUE_NUMBER は既にクローズ済みです"
  else
    log "✅ Issueクローズ: #$ISSUE_NUMBER"
    gh issue close "$ISSUE_NUMBER" --comment "✅ 開発完了・マージ済み" || {
      log_error "Issueクローズに失敗しました: #$ISSUE_NUMBER"
      exit 1
    }
  fi
}

# --------------------------------------------
# メイン処理
# --------------------------------------------
main() {
  check_args "$@"
  fetch_worktree_info
  load_env
  merge_into_main
  remove_worktree_db
  remove_worktree_container
  remove_worktree
  remove_branch
  close_issue
}

main "$@"
