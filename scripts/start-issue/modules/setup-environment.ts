import { PutParameterCommand, type SSMClient } from '@aws-sdk/client-ssm'
import { copyFileSync } from 'node:fs'
import path from 'node:path'

import { AWS, DATABASE, FILES, PORTS } from '../core/constants.js'
import type {
  CreateWorktreeOutput,
  SetupEnvironmentOutput,
  WorktreeParameters,
} from '../core/types.js'
import { PROJECT_ROOT, log } from '../core/utils.js'

export async function setupEnvironment(
  ctx: CreateWorktreeOutput
): Promise<SetupEnvironmentOutput> {
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

function truncateSlugForDatabase(slug: string): string {
  if (slug.length <= DATABASE.MAX_SLUG_LENGTH) {
    return slug
  }

  const lastHyphenIndex = slug.lastIndexOf('-', DATABASE.MAX_SLUG_LENGTH)
  return lastHyphenIndex > 0
    ? slug.substring(0, lastHyphenIndex)
    : slug.substring(0, DATABASE.MAX_SLUG_LENGTH)
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

function generateDatabaseName(slugTitle: string): string {
  const truncatedSlug = truncateSlugForDatabase(slugTitle)
  return `${DATABASE.NAME_PREFIX}${truncatedSlug.replace(/-/g, '_')}`
}

function buildDatabaseUrls(
  env: CreateWorktreeOutput['environment'],
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

/**
 * WorktreeのパラメータをParameter Storeに登録
 */
async function registerWorktreeParameters(
  client: SSMClient,
  issueNumber: number,
  params: WorktreeParameters
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

  const descriptors = Object.entries(params).map(describeParameter)
  const results = await Promise.all(
    descriptors.map((descriptor) => registerParameter(descriptor))
  )

  const successCount = results.filter((result) => result === 'success').length
  const errorCount = results.filter((result) => result === 'error').length

  log(`Parameter Store登録完了: 成功 ${successCount}件, エラー ${errorCount}件`)
}
