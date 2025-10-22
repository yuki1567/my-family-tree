#!/bin/bash

set -euo pipefail

# ============================================================
# AWS Systems Manager Parameter Store登録スクリプト
# ============================================================
# 説明:
#   .envファイルをAWS Systems Manager Parameter Storeに一括登録します。
#   パラメータ名は/family-tree/{environment}/{key-name}の形式で登録されます。
#
# 使用例:
#   aws-vault exec family-tree-dev -- ./scripts/ssm/register-params.sh development .env
#   aws-vault exec family-tree-prod -- ./scripts/ssm/register-params.sh production .env.production
#
# 前提条件:
#   - AWS CLIがインストールされていること
#   - aws-vault経由でAWS認証情報が設定されていること
#   - Parameter Store書き込み権限を持つIAMロールへのアクセス権があること
# ============================================================

# ============================================================
# 設定
# ============================================================

ENV=${1:-development}
ENV_FILE=${2:-.env}
REGION=${AWS_REGION:-ap-northeast-1}
KMS_KEY_ID=${AWS_KMS_KEY_ID:-}

# ============================================================
# バリデーション
# ============================================================

if [ ! -f "$ENV_FILE" ]; then
  echo "エラー: $ENV_FILE が見つかりません"
  exit 1
fi

if [ -z "$KMS_KEY_ID" ]; then
  echo "警告: AWS_KMS_KEY_IDが設定されていません。Parameter StoreのデフォルトKMSキーを使用します。"
fi

# ============================================================
# パラメータ変換関数
# ============================================================

convert_to_param_name() {
  local key=$1
  local env=$2
  local param_name=$(echo "$key" | tr '[:upper:]' '[:lower:]' | tr '_' '-')
  echo "/family-tree/${env}/${param_name}"
}

get_param_type() {
  local key=$1
  case $key in
    *SECRET*|*PASSWORD*|*TOKEN*|*KEY*|*DATABASE_URL*|*ADMIN_URL*)
      echo "SecureString"
      ;;
    *)
      echo "String"
      ;;
  esac
}

# ============================================================
# メイン処理
# ============================================================

echo "========================================="
echo "Parameter Store登録開始"
echo "========================================="
echo "環境: $ENV"
echo "ファイル: $ENV_FILE"
echo "リージョン: $REGION"
echo "========================================="
echo ""

registered_count=0
skipped_count=0
error_count=0

while IFS= read -r line || [ -n "$line" ]; do
  if [[ -z "$line" ]] || [[ "$line" =~ ^[[:space:]]*# ]]; then
    continue
  fi

  if [[ "$line" =~ ^([A-Z_][A-Z0-9_]*)=(.*)$ ]]; then
    key="${BASH_REMATCH[1]}"
    value="${BASH_REMATCH[2]}"

    param_name=$(convert_to_param_name "$key" "$ENV")
    param_type=$(get_param_type "$key")

    echo "登録中: $key -> $param_name (Type: $param_type)"

    if [ "$param_type" = "SecureString" ] && [ -n "$KMS_KEY_ID" ]; then
      if aws ssm put-parameter \
        --name "$param_name" \
        --value "$value" \
        --type "$param_type" \
        --key-id "$KMS_KEY_ID" \
        --overwrite \
        --region "$REGION" \
        >/dev/null 2>&1; then
        echo "  ✅ 成功"
        ((registered_count++))
      else
        echo "  ❌ 失敗"
        ((error_count++))
      fi
    else
      if aws ssm put-parameter \
        --name "$param_name" \
        --value "$value" \
        --type "$param_type" \
        --overwrite \
        --region "$REGION" \
        >/dev/null 2>&1; then
        echo "  ✅ 成功"
        ((registered_count++))
      else
        echo "  ❌ 失敗"
        ((error_count++))
      fi
    fi
  else
    echo "スキップ: $line (KEY=VALUE形式ではありません)"
    ((skipped_count++))
  fi
done < "$ENV_FILE"

# ============================================================
# 結果サマリー
# ============================================================

echo ""
echo "========================================="
echo "登録完了"
echo "========================================="
echo "登録成功: $registered_count 件"
echo "スキップ: $skipped_count 件"
echo "エラー: $error_count 件"
echo "========================================="

if [ $error_count -gt 0 ]; then
  echo "⚠️  エラーが発生しました。AWS認証情報とIAMロール権限を確認してください。"
  exit 1
fi

echo "✅ すべてのパラメータが正常に登録されました。"
exit 0
