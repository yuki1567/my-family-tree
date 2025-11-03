import { PutParameterCommand, type SSMClient } from '@aws-sdk/client-ssm'
import { copyFileSync } from 'node:fs'
import path from 'node:path'

import { AWS, DATABASE, FILES, PORTS } from '../core/constants.js'
import type {
  CreateWorktreeOutput,
  SetupEnvironmentOutput,
} from '../core/types.js'
import { PROJECT_ROOT, log } from '../core/utils.js'

export async function setupEnvironment(
  ctx: CreateWorktreeOutput
): Promise<SetupEnvironmentOutput> {
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

  await registerWorktreeParameters(ctx.ssmClient, ctx.gitHub.issueNumber, {
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

/**
 * WorktreeのパラメータをParameter Storeに登録
 */
async function registerWorktreeParameters(
  client: SSMClient,
  issueNumber: number,
  params: Record<string, string>
): Promise<void> {
  const pathPrefix = `${AWS.PARAMETER_PATH.WORKTREE}/${issueNumber}`

  log(`Parameter Storeにパラメータを登録中... (Path: ${pathPrefix})`)

  const classifyParameterType = (key: string): 'String' | 'SecureString' =>
    ['secret', 'password', 'url'].some((token) => key.includes(token))
      ? 'SecureString'
      : 'String'

  type ParameterDescriptor = {
    key: string
    value: string
    name: string
    type: 'String' | 'SecureString'
  }

  const describeParameter = ([key, value]: [
    string,
    string,
  ]): ParameterDescriptor => ({
    key,
    value,
    name: `${pathPrefix}/${key}`,
    type: classifyParameterType(key),
  })

  const registerParameter = async ({
    key,
    value,
    name,
    type,
  }: ParameterDescriptor): Promise<'success' | 'error'> => {
    try {
      await client.send(
        new PutParameterCommand({
          Name: name,
          Value: value,
          Type: type,
          Overwrite: true,
        })
      )
      log(`  ✓ ${key} を登録しました (Type: ${type})`)
      return 'success'
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      log(`  ✗ ${key} の登録に失敗しました: ${errorMessage}`)
      return 'error'
    }
  }

  const results = await Object.entries(params)
    .map(describeParameter)
    .reduce<Promise<Array<'success' | 'error'>>>(
      async (accPromise, descriptor) => {
        const acc = await accPromise
        const result = await registerParameter(descriptor)
        return [...acc, result]
      },
      Promise.resolve([])
    )

  const { successCount, errorCount } = results.reduce(
    (acc, result) => ({
      successCount: acc.successCount + (result === 'success' ? 1 : 0),
      errorCount: acc.errorCount + (result === 'error' ? 1 : 0),
    }),
    { successCount: 0, errorCount: 0 }
  )

  log(`Parameter Store登録完了: 成功 ${successCount}件, エラー ${errorCount}件`)
}
