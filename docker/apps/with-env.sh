#!/bin/bash
set -euo pipefail

log() { printf '[%(%Y-%m-%d %H:%M:%S)T] %s\n' -1 "$*"; }
fail() { log "ERROR: $*"; exit 1; }
need() { command -v "$1" >/dev/null 2>&1 || fail "'$1' が見つかりません"; }

check_required_commands() {
  need aws 
  need jq 
  need sed
  need tr
}

check_required_env() {
  if [ -z "$AWS_VAULT" ]; then
    fail "AWS_VAULTが設定されていません"
  fi

  if [ -z "$AWS_REGION" ]; then
    fail "AWS_REGIONが設定されていません"
  fi
}

judge_environment() {
  if [[ "$AWS_VAULT" == *"-worktree-"* ]]; then
    readonly ISSUE_NUMBER=$(echo "$AWS_VAULT" | sed 's/.*-worktree-//')
    readonly PARAM_PATH="/family-tree/worktree/${ISSUE_NUMBER}"
    log "環境: worktree (Issue #${ISSUE_NUMBER})"
  elif [[ "$AWS_VAULT" == *"-dev" ]]; then
    readonly PARAM_PATH="/family-tree/development"
    log "環境: development"
  elif [[ "$AWS_VAULT" == *"-test" ]]; then
    readonly PARAM_PATH="/family-tree/test"
    log "環境: test"
  elif [[ "$AWS_VAULT" == *"-prod" ]]; then
    readonly PARAM_PATH="/family-tree/production"
    log "環境: production"
  else
    fail "不明なAWS_VAULT形式: $AWS_VAULT"
  fi
}

get_parameter() {
  local params=$(aws ssm get-parameters-by-path \
  --path "$PARAM_PATH" \
  --with-decryption \
  --region "$AWS_REGION" \
  --output json 2>&1)

  local aws_exit_code=$?

  if [ $aws_exit_code -ne 0 ]; then
    fail "Parameter Store取得失敗(コマンド: $params)"
  fi

  local param_count=$(echo "$params" | jq '.Parameters | length')
  if [ "$param_count" -eq 0 ]; then
    fail "Parameter Store未定義(パス: $PARAM_PATH)"
  fi

  log "$param_count 件のパラメータを取得"
  echo "$params"
}

set_parameter() {
  local params=$1
  local count=0
  local env_name

  while IFS='=' read -r name value; do
    [ -n "$name" ] && [ -n "$value" ] || continue

    env_name=$(echo "$name" | sed "s|${PARAM_PATH}/||" | tr '[:lower:]' '[:upper:]' | tr '-' '_')
    export "$env_name=$value"
    count=$((count + 1))
  done < <(echo "$params" | jq -r '.Parameters[] | "\(.Name)=\(.Value)"')

  [ "$count" -gt 0 ] || fail "Parameter Storeから取得したデータが空です"

  log "Parameter Storeから ${count} 件の環境変数をエクスポート完了"
}

exec_commands() {
  log "コマンドを実行: $*"
  exec "$@"
}

main() {
  if (( $# == 0 )); then
    fail "実行コマンドが未指定です"
  fi
  check_required_commands
  check_required_env
  judge_environment

  local params
  params=$(get_parameter)

  set_parameter "$params"
  exec_commands "$@"
}

main "$@"