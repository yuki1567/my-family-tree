#!/usr/bin/env bash
set -euo pipefail

COMPOSE_CMD=(docker compose)
export ENV_FILE=".env.test"

"${COMPOSE_CMD[@]}" exec apps npm run test:unit --workspace=apps/backend

"${COMPOSE_CMD[@]}" --profile test up --wait -d test-db

"${COMPOSE_CMD[@]}" run --rm apps npm run test:integration --workspace=apps/backend

"${COMPOSE_CMD[@]}" stop test-db

"${COMPOSE_CMD[@]}" rm -f test-db