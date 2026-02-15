#!/bin/bash
set -euo pipefail

printf '[%(%Y-%m-%d %H:%M:%S)T] Starting application...\n' -1 >&2

exec with-env bash -c '
  pm2 start ecosystem.config.cjs --only frontend-dev,backend-dev
  tail -f /dev/null
'
