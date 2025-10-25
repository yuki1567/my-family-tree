#!/bin/bash
set -e

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# AWS_VAULTから環境を判定
if [ -z "$AWS_VAULT" ]; then
  log "ERROR: AWS_VAULTが設定されていません"
  exit 1
fi

log "AWS_VAULT: $AWS_VAULT から環境情報を取得中..."

# 環境パス決定
if [[ "$AWS_VAULT" == *"-worktree-"* ]]; then
  ISSUE_NUMBER=$(echo "$AWS_VAULT" | sed 's/.*-worktree-//')
  PARAM_PATH="/family-tree/worktree/${ISSUE_NUMBER}"
  log "環境: worktree (Issue #${ISSUE_NUMBER})"
elif [[ "$AWS_VAULT" == *"-dev" ]]; then
  PARAM_PATH="/family-tree/development"
  log "環境: development"
elif [[ "$AWS_VAULT" == *"-test" ]]; then
  PARAM_PATH="/family-tree/test"
  log "環境: test"
elif [[ "$AWS_VAULT" == *"-prod" ]]; then
  PARAM_PATH="/family-tree/production"
  log "環境: production"
else
  log "ERROR: 不明なAWS_VAULT形式: $AWS_VAULT"
  log "想定形式: family-tree-{dev|test|prod|worktree-{ISSUE_NUMBER}}"
  exit 1
fi

log "Parameter Storeから環境変数を取得中... (Path: $PARAM_PATH)"

REGION="${AWS_REGION:-ap-northeast-1}"

# AWS CLIでParameter Storeから全パラメータを取得
params=$(aws ssm get-parameters-by-path \
  --path "$PARAM_PATH" \
  --with-decryption \
  --region "$REGION" \
  --output json 2>&1)

aws_exit_code=$?

# AWS CLIのエラーチェック
if [ $aws_exit_code -ne 0 ]; then
  log "ERROR: Parameter Store取得に失敗しました"
  log "$params"
  exit 1
fi

# パラメータが見つからない場合
param_count=$(echo "$params" | jq '.Parameters | length')
if [ "$param_count" -eq 0 ]; then
  log "ERROR: Parameter Storeにパラメータが見つかりませんでした (Path: $PARAM_PATH)"
  exit 1
fi

log "Parameter Store から $param_count 件のパラメータを取得しました"

# 一時ファイルを使用してパラメータを環境変数に変換
temp_env_file="/tmp/with_env_params_$$.env"
echo "$params" | jq -r '.Parameters[] | "\(.Name)=\(.Value)"' > "$temp_env_file"

# 一時ファイルが空または存在しない場合のチェック
if [ ! -s "$temp_env_file" ]; then
  log "ERROR: Parameter Storeから取得したデータが空です"
  rm -f "$temp_env_file"
  exit 1
fi

# ファイルから読み込んで環境変数に設定
while IFS='=' read -r name value; do
  # Parameter Store のパス形式から環境変数名に変換
  env_name=$(echo "$name" | sed "s|${PARAM_PATH}/||" | tr '[:lower:]' '[:upper:]' | tr '-' '_')

  # 環境変数として export
  export "$env_name=$value"
done < "$temp_env_file"

# クリーンアップ
rm -f "$temp_env_file"
log "Parameter Store からの環境変数取得が完了しました"

# 引数として渡されたコマンドを実行
log "コマンドを実行: $*"
exec "$@"
