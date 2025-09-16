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
  export $(grep -v '^#' "$ENV_FILE" | xargs)
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
  docker-compose exec db mysql -u root -p"${MYSQL_ROOT_PASSWORD}" -e "DROP DATABASE IF EXISTS \`${DB_NAME}\`;"
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
  log "🗑 ローカルブランチ削除: $WORKTREE_BRANCH"
  git branch -D "$WORKTREE_BRANCH" || log "ローカルブランチは既に削除済み"
  log "🗑 リモートブランチ削除: $WORKTREE_BRANCH"
  git push origin --delete "$WORKTREE_BRANCH" || log "リモートブランチは既に削除済み"
}

# --------------------------------------------
# Issueクローズ
# --------------------------------------------
close_issue() {
  log "📌 Issueクローズ: $ISSUE_NUMBER"
  gh issue close "$ISSUE_NUMBER" --comment "✅ 開発完了・マージ済み" || log "Issueは既にクローズ済み"
  log "📌 Issueクローズ: $WORKTREE_BRANCH"
}

# --------------------------------------------
# メイン処理
# --------------------------------------------
main() {
  check_args "$@"
  fetch_worktree_info
  load_env
  remove_worktree_db
  remove_worktree
  remove_branch
  close_issue
}

main "$@"
