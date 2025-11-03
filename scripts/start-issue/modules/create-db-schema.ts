import { spawnSync } from 'node:child_process'

import { DOCKER } from '../core/constants.js'
import { DatabaseCommandError } from '../core/errors.js'
import type { SetupEnvironmentOutput } from '../core/types.js'
import { PROJECT_ROOT, log } from '../core/utils.js'

export function createDbSchema(ctx: SetupEnvironmentOutput): void {
  const dbName = ctx.environment.dbName
  const adminPassword = ctx.environment.dbAdminPassword

  log('データベーススキーマを作成中...')

  const command = 'docker-compose'
  const args = [
    'exec',
    '-T',
    '-e',
    `PGPASSWORD=${adminPassword}`,
    DOCKER.DB_SERVICE,
    'psql',
    '-U',
    DOCKER.DB_ADMIN_USER,
    '-d',
    DOCKER.DB_DEFAULT_DATABASE,
    '-c',
    `CREATE DATABASE ${dbName};`,
  ]

  const result = spawnSync(command, args, {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    throw new DatabaseCommandError(command, args, dbName)
  }

  log(`DBスキーマを作成しました: ${dbName}`)
}
