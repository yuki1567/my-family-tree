#!/usr/bin/env bash
set -euo pipefail

# クリーンアップ関数
cleanup() {
  local exit_code=$?

  docker compose --profile test rm -sf test-db || true

  exit $exit_code
}

trap cleanup EXIT TERM

# Unit Testをホスト環境で実行
pnpm --filter @family-tree-app/backend test:unit

# Test DBコンテナを起動
docker compose --profile test up -d --force-recreate test-db

# Integration Testをホスト環境で実行
pnpm --filter @family-tree-app/backend test:integration
