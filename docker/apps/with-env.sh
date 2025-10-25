#!/bin/bash
set -euo pipefail

log() { printf '[%(%Y-%m-%d %H:%M:%S)T] %s\n' -1 "$*" >&2; }
die() { log "ERROR: $*"; exit 1; }
need() { command -v "$1" >/dev/null 2>&1 || die "'$1' が見つかりません"; }

check_required_commands() {
  need aws
  need jq
  need tr
}

check_required_env() {
  [[ -n "${AWS_VAULT:-}"  ]] || die "AWS_VAULTが設定されていません"
  [[ -n "${AWS_REGION:-}" ]] || die "AWS_REGIONが設定されていません"
}

judge_environment() {
  if [[ "$AWS_VAULT" == *"-worktree-"* ]]; then
    local issue_number="${AWS_VAULT##*-worktree-}"
    readonly PARAM_PATH="/family-tree/worktree/${issue_number}"
    log "環境: worktree (Issue #${issue_number})"
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
    die "不明なAWS_VAULT形式: $AWS_VAULT"
  fi
}

get_parameters() {
  local max_pages=10
  local output='{"Parameters":[]}'
  local next="" response token

  for ((i=1; i<=max_pages; i++)); do
    response=$(aws ssm get-parameters-by-path \
      --path "$PARAM_PATH" \
      --with-decryption \
      --region "$AWS_REGION" \
      --output json ${next:+--next-token "$next"} 2>&1) \
      || die "Parameter Store取得失敗"

    output=$(jq -nc --argjson response "$response" --argjson output "$output" \
      '{Parameters: ($output.Parameters + $response.Parameters)}') \
      || die "jq処理失敗"

    token=$(jq -r '.NextToken // empty' <<<"$response" || true)
    [[ -z "$token" ]] && break
    next="$token"
  done

  [[ -n "$next" ]] && die "ページ上限に達しました"
  local count; count=$(jq '.Parameters | length' <<<"$output")
  (( count > 0 )) || die "Parameter Store未定義(パス: $PARAM_PATH)"
  log "${count} 件のパラメータを取得"
  printf '%s' "$output"
}

set_parameters() {
  local params=$1
  local count=0
  local env_name

  while IFS='=' read -r name value; do
    [ -n "$name" ] && [ -n "$value" ] || continue

    env_name="$(printf '%s' "${name#${PARAM_PATH}/}" | tr '[:lower:]-' '[:upper:]_')"
    export "$env_name=$value"
    count=$((count + 1))
  done < <(echo "$params" | jq -r '.Parameters[] | "\(.Name)=\(.Value)"')

  [ "$count" -gt 0 ] || die "Parameter Storeから取得したデータが空です"

  log "Parameter Storeから ${count} 件の環境変数をエクスポート完了"
}

main() {
  if (( $# == 0 )); then
    die "実行コマンドが未指定です"
  fi
  check_required_commands
  check_required_env
  judge_environment

  local params
  params=$(get_parameters)

  set_parameters "$params"
  exec "$@"
}

main "$@"