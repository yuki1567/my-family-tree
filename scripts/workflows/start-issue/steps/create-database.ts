import { execSync } from 'node:child_process'

import { createDatabase as libCreateDatabase } from '../../lib/database.js'
import type { CreateAwsProfileContext } from '../../shared/types.js'
import { log } from '../../shared/utils.js'

export function createDatabase(ctx: CreateAwsProfileContext): void {
  libCreateDatabase(ctx.environment.dbName, ctx.environment.dbAdminPassword)

  log('🔄 Prisma migrateを実行中...')
  try {
    execSync(
      `cd "${ctx.environment.worktreePath}" && AWS_PROFILE=${ctx.environment.awsProfileName} npx prisma migrate deploy`,
      { stdio: 'inherit' }
    )
    log('✅ Prisma migrate完了')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new Error(`Prisma migrate実行に失敗しました: ${errorMessage}`)
  }
}
