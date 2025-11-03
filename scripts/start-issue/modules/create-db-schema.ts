import { spawnSync } from 'node:child_process'

import { DOCKER } from '../core/constants.js'
import type { GenerateEnvFileOutput } from '../core/types.js'
import { PROJECT_ROOT, log } from '../core/utils.js'

export function createDbSchema(ctx: GenerateEnvFileOutput): void {
  const dbName = ctx.environment.dbName
  const adminPassword = ctx.environment.dbAdminPassword

  log('データベーススキーマを作成中...')
  const result = spawnSync(
    'docker-compose',
    [
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
    ],
    {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
    }
  )

  if (result.status !== 0) {
    throw new Error('PostgreSQLコマンドの実行に失敗しました')
  }

  log(`DBスキーマを作成しました: ${dbName}`)
}
