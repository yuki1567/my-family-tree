#!/usr/bin/env bash
set -euo pipefail

# 環境変数のデバッグ出力（CI環境のみ）
if [[ "${CI:-}" == "true" ]]; then
  echo "[Test Script] AWS_VAULT: ${AWS_VAULT:-not set}"
  echo "[Test Script] AWS_REGION: ${AWS_REGION:-not set}"
  echo "[Test Script] AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID:0:10}..."
fi

# クリーンアップ関数
cleanup() {
  local exit_code=$?

  docker compose --profile test rm -sf test-db || true

  exit $exit_code
}

trap cleanup EXIT TERM

# Unit Testをホスト環境で実行
npm run test:unit --workspace=apps/backend

# Test DBコンテナを起動
docker compose --profile test up -d --force-recreate test-db

# Integration Testをホスト環境で実行
npm run test:integration --workspace=apps/backend