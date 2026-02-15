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
  [[ -n "${APP_ENV:-}" ]] || die "APP_ENVが設定されていません"
}

setup_param_path() {
  readonly PARAM_PATH="/family-tree/${APP_ENV}"
  log "環境: ${APP_ENV} (パス: ${PARAM_PATH})"
}

get_parameters() {
  local max_pages=10
  local output='{"Parameters":[]}'
  local next="" response token

  for ((i=1; i<=max_pages; i++)); do
    response=$(aws ssm get-parameters-by-path \
      --path "$PARAM_PATH" \
      --with-decryption \
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

set_db_parameters() {
  local params=$1
  local env_name

  while IFS='=' read -r name value; do
    [ -n "$name" ] && [ -n "$value" ] || continue

    env_name="$(printf '%s' "${name#${PARAM_PATH}/}" | tr '[:lower:]-' '[:upper:]_')"

    if [[ "$env_name" == "DATABASE_ADMIN_USER" ]]; then
      export POSTGRES_USER="$value"
    elif [[ "$env_name" == "DATABASE_ADMIN_PASSWORD" ]]; then
      export POSTGRES_PASSWORD="$value"
    elif [[ "$env_name" == "DATABASE_NAME" ]]; then
      export POSTGRES_DB="$value"
    elif [[ "$env_name" == "DATABASE_USER_PASSWORD" ]]; then
      export DATABASE_USER_PASSWORD="$value"
    fi
  done < <(echo "$params" | jq -r '.Parameters[] | "\(.Name)=\(.Value)"')

  [[ -n "${POSTGRES_USER:-}" ]] || die "POSTGRES_USER (database-admin-user) が見つかりません"
  [[ -n "${POSTGRES_PASSWORD:-}" ]] || die "POSTGRES_PASSWORD (database-admin-password) が見つかりません"
  [[ -n "${POSTGRES_DB:-}" ]] || die "POSTGRES_DB (database-name) が見つかりません"
  [[ -n "${DATABASE_USER_PASSWORD:-}" ]] || die "DATABASE_USER_PASSWORD (database-user-password) が見つかりません"

  log "Parameter Storeから必須パラメータをエクスポート完了"
}

create_init_script() {
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
  log "初期化スクリプトを作成しました"
}

main() {
  log "PostgreSQLコンテナを起動中..."

  check_required_commands
  check_required_env
  setup_param_path

  local params
  params=$(get_parameters)
  set_db_parameters "$params"

  create_init_script

  log "PostgreSQL起動処理を開始します..."
  exec docker-entrypoint.sh "$@"
}

main "$@"
