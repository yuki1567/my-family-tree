import { copyFileSync } from 'node:fs'
import path from 'node:path'

import { putParameters } from '../../lib/aws-ssm.js'
import { generateDatabaseName } from '../../lib/database.js'
import { FILES, PORTS } from '../../shared/constants.js'
import type { WorkflowContext } from '../../shared/types.js'
import { PROJECT_ROOT, log } from '../../shared/utils.js'

export async function setupEnvironment(
  ctx: WorkflowContext
): Promise<SetupEnvironmentContext> {
  const { webPort, apiPort } = calculateWorktreePorts(ctx.gitHub.issueNumber)
  const dbName = generateDatabaseName(ctx.gitHub.issueSlugTitle)
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

  const { databaseUrl, databaseAdminUrl } = buildDatabaseUrls(
    ctx.environment,
    dbName
  )

  await putParameters(ctx.ssmClient, ctx.gitHub.issueNumber, {
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

function calculateWorktreePorts(issueNumber: number): {
  webPort: number
  apiPort: number
} {
  return {
    webPort: PORTS.WEB_BASE + issueNumber,
    apiPort: PORTS.API_BASE + issueNumber,
  }
}

function buildDatabaseUrls(
  env: CreateWorktreeContext['environment'],
  dbName: string
): {
  databaseUrl: string
  databaseAdminUrl: string
} {
  return {
    databaseUrl: `postgresql://${env.dbUser}:${env.dbUserPassword}@db:5432/${dbName}`,
    databaseAdminUrl: `postgresql://${env.dbAdminUser}:${env.dbAdminPassword}@db:5432/postgres`,
  }
}
