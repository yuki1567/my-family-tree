#!/bin/bash
set -e

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# AWS Parameter Storeから環境変数を取得
load_parameters_from_ssm() {
  local region="${AWS_REGION:-ap-northeast-1}"
  local param_path=""

  # 環境に応じたParameter Storeパスを決定
  if [ -z "$APP_ENV" ]; then
    log "ERROR: APP_ENV環境変数が設定されていません"
    exit 1
  fi

  if [ "$APP_ENV" = "worktree" ]; then
    if [ -z "$ISSUE_NUMBER" ]; then
      log "ERROR: Worktree環境ではISSUE_NUMBER環境変数が必要です"
      exit 1
    fi
    param_path="/family-tree/worktree/${ISSUE_NUMBER}"
  elif [ "$APP_ENV" = "development" ]; then
    param_path="/family-tree/development"
  elif [ "$APP_ENV" = "test" ]; then
    param_path="/family-tree/test"
  elif [ "$APP_ENV" = "production" ]; then
    param_path="/family-tree/production"
  else
    log "ERROR: 不明なAPP_ENV値: $APP_ENV"
    exit 1
  fi

  log "Parameter Storeから環境変数を取得中... (Path: $param_path)"

  # AWS CLIでParameter Storeから全パラメータを取得
  local params
  params=$(aws ssm get-parameters-by-path \
    --path "$param_path" \
    --with-decryption \
    --region "$region" \
    --output json 2>/dev/null || echo '{"Parameters":[]}')

  # パラメータが見つからない場合
  local param_count
  param_count=$(echo "$params" | jq '.Parameters | length')
  if [ "$param_count" -eq 0 ]; then
    log "WARNING: Parameter Storeにパラメータが見つかりませんでした (Path: $param_path)"
    log "INFO: 既存の環境変数を使用します"
    return
  fi

  log "Parameter Store から $param_count 件のパラメータを取得しました"

  # パラメータをループして環境変数に設定
  echo "$params" | jq -r '.Parameters[] | "\(.Name)=\(.Value)"' | while IFS='=' read -r name value; do
    # Parameter Store のパス形式から環境変数名に変換
    # 例: /family-tree/development/database-url -> DATABASE_URL
    local env_name
    env_name=$(echo "$name" | sed "s|$param_path/||" | tr '[:lower:]' '[:upper:]' | tr '-' '_')

    # 環境変数として export
    export "$env_name=$value"
    log "  ✓ $env_name を設定しました"
  done

  log "Parameter Store からの環境変数取得が完了しました"
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

# メイン実行
main() {
  log "Starting application..."

  # Parameter Storeから環境変数を取得
  load_parameters_from_ssm

  wait_for_db

  # PM2でアプリケーション起動
  pm2 start ecosystem.config.cjs

  # コンテナを維持するため無限待機
  tail -f /dev/null
}

main