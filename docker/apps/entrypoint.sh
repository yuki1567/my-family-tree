#!/bin/bash
set -e

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# データベース接続待機
wait_for_db() {
  log "Waiting for PostgreSQL database..."
  local timeout=60
  local count=0

  until pg_isready -h db -U family_tree_user; do
    count=$((count + 1))
    if [ $count -ge $timeout ]; then
      echo "Database connection timeout"
      exit 1
    fi
    sleep 1
  done
  log "Database ready"
}

# Drizzle設定（開発環境用）
setup_drizzle() {
  log "Setting up Drizzle..."
  npm run db:push --workspace=apps/backend
  log "Drizzle setup completed"
}

# メイン実行
main() {
  log "Starting application..."
  wait_for_db
  setup_drizzle

  # PM2でアプリケーション起動
  pm2 start ecosystem.config.cjs

  # コンテナを維持するため無限待機
  tail -f /dev/null
}

main