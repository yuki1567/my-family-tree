import { copyFileSync } from 'node:fs'
import path from 'node:path'

import { DATABASE, FILES, PORTS } from '../core/constants.js'
import type { Ctx } from '../core/types.js'
import { PROJECT_ROOT, log } from '../core/utils.js'
import {
  assertBranchName,
  assertDbAdminPassword,
  assertDbAdminUser,
  assertDbUser,
  assertDbUserPassword,
  assertIssueNumber,
  assertIssueSlugTitle,
  assertWorktreePath,
} from '../core/validators.js'

import { registerWorktreeParameters } from './parameter-store.js'

export async function generateEnvFile(ctx: Ctx): Promise<Ctx> {
  assertIssueNumber(ctx)
  assertIssueSlugTitle(ctx)
  assertWorktreePath(ctx)
  assertBranchName(ctx)
  assertDbAdminUser(ctx)
  assertDbAdminPassword(ctx)
  assertDbUser(ctx)
  assertDbUserPassword(ctx)

  const webPort = PORTS.WEB_BASE + ctx.gitHub.issueNumber
  const apiPort = PORTS.API_BASE + ctx.gitHub.issueNumber
  const truncatedSlug =
    ctx.gitHub.issueSlugTitle.length > DATABASE.MAX_SLUG_LENGTH
      ? ctx.gitHub.issueSlugTitle.substring(
          0,
          ctx.gitHub.issueSlugTitle.lastIndexOf('-', DATABASE.MAX_SLUG_LENGTH)
        )
      : ctx.gitHub.issueSlugTitle
  const dbName = `${DATABASE.NAME_PREFIX}${truncatedSlug.replace(/-/g, '_')}`
  const appName = `app-${ctx.gitHub.issueSlugTitle}`

  const srcClaudeLocalSettings = path.join(
    PROJECT_ROOT,
    FILES.CLAUDE_LOCAL_SETTINGS
  )
  const dstClaudeLocalSettings = path.join(
    ctx.environment.worktreePath,
    FILES.CLAUDE_LOCAL_SETTINGS
  )

  copyFileSync(srcClaudeLocalSettings, dstClaudeLocalSettings)
  log(`Claudeローカル設定ファイルをコピーしました: ${dstClaudeLocalSettings}`)

  const databaseUrl = `postgresql://${ctx.environment.dbUser}:${ctx.environment.dbUserPassword}@db:5432/${dbName}`
  const databaseAdminUrl = `postgresql://${ctx.environment.dbAdminUser}:${ctx.environment.dbAdminPassword}@db:5432/postgres`

  await registerWorktreeParameters(ctx.gitHub.issueNumber, {
    'branch-name': ctx.gitHub.branchName,
    'issue-number': String(ctx.gitHub.issueNumber),
    'web-port': String(webPort),
    'api-port': String(apiPort),
    'database-url': databaseUrl,
    'database-admin-url': databaseAdminUrl,
    'log-level': 'query,info,warn,error',
    'database-admin-user': ctx.environment.dbAdminUser,
    'database-admin-password': ctx.environment.dbAdminPassword,
    'database-name': dbName,
    'database-user': ctx.environment.dbUser,
    'database-user-password': ctx.environment.dbUserPassword,
  })

  return {
    ...ctx,
    environment: {
      ...ctx.environment,
      webPort,
      apiPort,
      dbName,
      appName,
    },
  }
}
