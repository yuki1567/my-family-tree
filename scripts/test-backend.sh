#!/usr/bin/env bash
set -euo pipefail

source .env
APP_CONTAINER_NAME="${COMPOSE_PROJECT_NAME}"
TEST_DB_CONTAINER="test-db"
TEST_NETWORK="test-network"

# クリーンアップ関数
cleanup() {
  local exit_code=$?

  docker network disconnect "${TEST_NETWORK}" "${APP_CONTAINER_NAME}" || true
  docker rm -f "${TEST_DB_CONTAINER}" || true
  docker network rm "${TEST_NETWORK}" || true

  exit $exit_code
}

trap cleanup EXIT TERM

docker exec -t "${APP_CONTAINER_NAME}" npm run test:unit --workspace=apps/backend

docker network create "${TEST_NETWORK}"

docker run -d \
  --name "${TEST_DB_CONTAINER}" \
  --network "${TEST_NETWORK}" \
  --memory="256m" \
  --memory-swap="256m" \
  --env-file .env.test \
  -v "./docker/db/init.sh:/docker-entrypoint-initdb.d/init.sh:ro" \
  postgres:18-alpine

docker network connect "${TEST_NETWORK}" "${APP_CONTAINER_NAME}"

docker exec -t --env-file .env.test "${APP_CONTAINER_NAME}" npm run test:integration --workspace=apps/backend