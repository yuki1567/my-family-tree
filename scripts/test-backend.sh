#!/usr/bin/env bash
set -euo pipefail

COMPOSE_CMD=(docker compose)
export ENV_FILE=".env.test"

"${COMPOSE_CMD[@]}" exec apps npm run test:unit --workspace=apps/backend

"${COMPOSE_CMD[@]}" --profile test up --wait -d test-db

"${COMPOSE_CMD[@]}" run --rm \
  -e ROOT_PATH=/usr/src \
  -e DATABASE_URL="mysql://testuser:testpass@test-db:3306/family_tree_test" \
  -e LOG_LEVEL=error \
  apps npm run test:integration --workspace=apps/backend

"${COMPOSE_CMD[@]}" stop test-db

"${COMPOSE_CMD[@]}" rm -f test-db