#!/bin/bash
set -e

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# AWS_VAULTから環境判定
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
  exit 1
fi

log "Parameter Storeからデータベース設定を取得中... (Path: $PARAM_PATH)"

REGION="${AWS_REGION:-ap-northeast-1}"

# AWS CLIでParameter Storeから全パラメータを一括取得
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
temp_env_file="/tmp/db_ssm_params_$$.env"
echo "$params" | jq -r '.Parameters[] | "\(.Name)=\(.Value)"' > "$temp_env_file"

# 必要な環境変数を抽出
while IFS='=' read -r name value; do
  # Parameter Store のパス形式から環境変数名に変換
  env_name=$(echo "$name" | sed "s|${PARAM_PATH}/||" | tr '[:lower:]' '[:upper:]' | tr '-' '_')

  case "$env_name" in
    DATABASE_ADMIN_USER)
      export POSTGRES_USER="$value"
      log "  ✓ POSTGRES_USER を設定しました"
      ;;
    DATABASE_ADMIN_PASSWORD)
      export POSTGRES_PASSWORD="$value"
      log "  ✓ POSTGRES_PASSWORD を設定しました"
      ;;
    DATABASE_NAME)
      export POSTGRES_DB="$value"
      log "  ✓ POSTGRES_DB を設定しました"
      ;;
    DATABASE_USER_PASSWORD)
      export DATABASE_USER_PASSWORD="$value"
      log "  ✓ DATABASE_USER_PASSWORD を設定しました"
      ;;
  esac
done < "$temp_env_file"

rm -f "$temp_env_file"

# 必須パラメータチェック
if [ -z "$POSTGRES_USER" ] || [ -z "$POSTGRES_PASSWORD" ] || [ -z "$POSTGRES_DB" ] || [ -z "$DATABASE_USER_PASSWORD" ]; then
  log "ERROR: 必須パラメータが不足しています"
  [ -z "$POSTGRES_USER" ] && log "  - POSTGRES_USER (database-admin-user) が見つかりません"
  [ -z "$POSTGRES_PASSWORD" ] && log "  - POSTGRES_PASSWORD (database-admin-password) が見つかりません"
  [ -z "$POSTGRES_DB" ] && log "  - POSTGRES_DB (database-name) が見つかりません"
  [ -z "$DATABASE_USER_PASSWORD" ] && log "  - DATABASE_USER_PASSWORD (database-user-password) が見つかりません"
  exit 1
fi

log "Parameter Store からの設定取得が完了しました"

# 初期化スクリプトを動的に作成
cat > /docker-entrypoint-initdb.d/create-user.sh <<'EOF'
#!/bin/bash
set -e

echo "[$(date +'%Y-%m-%d %H:%M:%S')] データベースユーザーを作成中..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE ROLE family_tree_user WITH LOGIN PASSWORD '$DATABASE_USER_PASSWORD';
  GRANT CONNECT ON DATABASE $POSTGRES_DB TO family_tree_user;
  GRANT USAGE ON SCHEMA public TO family_tree_user;
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO family_tree_user;
  GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO family_tree_user;
  ALTER DEFAULT PRIVILEGES FOR ROLE $POSTGRES_USER IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO family_tree_user;
  ALTER DEFAULT PRIVILEGES FOR ROLE $POSTGRES_USER IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO family_tree_user;
EOSQL

echo "[$(date +'%Y-%m-%d %H:%M:%S')] データベースユーザー作成が完了しました"
EOF

chmod +x /docker-entrypoint-initdb.d/create-user.sh

log "PostgreSQL起動処理を開始します..."

# PostgreSQL公式のentrypointを実行
exec docker-entrypoint.sh "$@"
