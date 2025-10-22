#!/bin/bash
set -e

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# AWS Parameter Storeから環境変数を取得
load_parameters_from_ssm() {
  local region="${AWS_REGION:-ap-northeast-1}"
  local param_path=""
  local app_env=""
  local issue_number=""

  # AWS_VAULTから環境とissue番号を判定
  if [ -z "$AWS_VAULT" ]; then
    log "ERROR: AWS_VAULTが設定されていません"
    exit 1
  fi

  log "AWS_VAULT: $AWS_VAULT から環境情報を取得中..."

  # AWS_VAULTのフォーマット:
  # - family-tree-dev → development
  # - family-tree-test → test
  # - family-tree-prod → production
  # - family-tree-worktree-{ISSUE_NUMBER} → worktree
  if [[ "$AWS_VAULT" == *"-worktree-"* ]]; then
    app_env="worktree"
    issue_number=$(echo "$AWS_VAULT" | sed 's/.*-worktree-//')
    param_path="/family-tree/worktree/${issue_number}"
    log "環境: worktree (Issue #${issue_number})"
  elif [[ "$AWS_VAULT" == *"-dev" ]]; then
    app_env="development"
    param_path="/family-tree/development"
    log "環境: development"
  elif [[ "$AWS_VAULT" == *"-test" ]]; then
    app_env="test"
    param_path="/family-tree/test"
    log "環境: test"
  elif [[ "$AWS_VAULT" == *"-prod" ]]; then
    app_env="production"
    param_path="/family-tree/production"
    log "環境: production"
  else
    log "ERROR: 不明なAWS_VAULT形式: $AWS_VAULT"
    log "想定形式: family-tree-{dev|test|prod|worktree-{ISSUE_NUMBER}}"
    exit 1
  fi

  log "Parameter Storeから環境変数を取得中... (Path: $param_path)"

  # AWS CLIでParameter Storeから全パラメータを取得
  # AWS Vault経由で認証情報が環境変数に設定されているため、profileは不要
  local params
  params=$(aws ssm get-parameters-by-path \
    --path "$param_path" \
    --with-decryption \
    --region "$region" \
    --output json 2>&1)

  local aws_exit_code=$?

  # AWS CLIのエラーチェック
  if [ $aws_exit_code -ne 0 ]; then
    log "ERROR: Parameter Store取得に失敗しました"
    log "$params"
    exit 1
  fi

  # パラメータが見つからない場合
  local param_count
  param_count=$(echo "$params" | jq '.Parameters | length')
  if [ "$param_count" -eq 0 ]; then
    log "WARNING: Parameter Storeにパラメータが見つかりませんでした (Path: $param_path)"
    log "INFO: 既存の環境変数を使用します"
    return
  fi

  log "Parameter Store から $param_count 件のパラメータを取得しました"

  # 一時ファイルを使用してパイプ問題を回避
  local temp_env_file="/tmp/ssm_params_$$.env"
  echo "$params" | jq -r '.Parameters[] | "\(.Name)=\(.Value)"' > "$temp_env_file"

  # 一時ファイルが空または存在しない場合のチェック
  if [ ! -s "$temp_env_file" ]; then
    log "WARNING: Parameter Storeから取得したデータが空です"
    rm -f "$temp_env_file"
    return
  fi

  # ファイルから読み込んで環境変数に設定
  while IFS='=' read -r name value; do
    # Parameter Store のパス形式から環境変数名に変換
    # 例: /family-tree/development/database-url -> DATABASE_URL
    local env_name
    env_name=$(echo "$name" | sed "s|${param_path}/||" | tr '[:lower:]' '[:upper:]' | tr '-' '_')

    # 環境変数として export
    export "$env_name=$value"
    log "  ✓ $env_name を設定しました"
  done < "$temp_env_file"

  # クリーンアップ
  rm -f "$temp_env_file"
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
ß
main() {
  log "Starting application..."

  # Parameter Storeから環境変数を取得
  load_parameters_from_ssm

  # wait_for_db

  # PM2でアプリケーション起動
  pm2 start ecosystem.config.cjs

  # コンテナを維持するため無限待機
  tail -f /dev/null
}

main