import { PutParameterCommand, type SSMClient } from '@aws-sdk/client-ssm'
import { copyFileSync } from 'node:fs'
import path from 'node:path'

import {
  AWS,
  DATABASE,
  FILES,
  PORTS,
  WORKTREE_PARAMETERS,
} from '../core/constants.js'
import type {
  CreateWorktreeOutput,
  ParameterDescriptor,
  SetupEnvironmentOutput,
  WorktreeParameterKey,
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

const VALID_WORKTREE_KEYS = new Set<string>(WORKTREE_PARAMETERS.ALL_KEYS)
const SECURE_KEYS = new Set<string>(WORKTREE_PARAMETERS.SECURE_KEYS)

async function registerWorktreeParameters(
  client: SSMClient,
  issueNumber: number,
  params: WorktreeParameters
): Promise<void> {
  const pathPrefix = `${AWS.PARAMETER_PATH.WORKTREE}/${issueNumber}`

  log(`Parameter Storeにパラメータを登録中... (Path: ${pathPrefix})`)

  const descriptors = Object.entries(params).map(([key, value]) =>
    createParameterDescriptor(pathPrefix, key, value)
  )

  const results = await Promise.all(
    descriptors.map((descriptor) => registerSingleParameter(client, descriptor))
  )

  const successCount = results.filter(Boolean).length
  const errorCount = results.length - successCount

  log(`Parameter Store登録完了: 成功 ${successCount}件, エラー ${errorCount}件`)
}

function createParameterDescriptor(
  pathPrefix: string,
  key: string,
  value: string
): ParameterDescriptor {
  if (!isWorktreeParameterKey(key)) {
    throw new Error(`Invalid worktree parameter key: ${key}`)
  }

  return {
    key,
    value,
    name: `${pathPrefix}/${key}`,
    type: classifyParameterType(key),
  }
}

async function registerSingleParameter(
  client: SSMClient,
  descriptor: ParameterDescriptor
): Promise<boolean> {
  try {
    await client.send(
      new PutParameterCommand({
        Name: descriptor.name,
        Value: descriptor.value,
        Type: descriptor.type,
        Overwrite: true,
      })
    )
    log(`  ✓ ${descriptor.key} を登録しました (Type: ${descriptor.type})`)
    return true
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    log(`  ✗ ${descriptor.key} の登録に失敗しました: ${errorMessage}`)
    return false
  }
}

function isWorktreeParameterKey(key: string): key is WorktreeParameterKey {
  return VALID_WORKTREE_KEYS.has(key)
}

function classifyParameterType(
  key: WorktreeParameterKey
): 'String' | 'SecureString' {
  return SECURE_KEYS.has(key) ? 'SecureString' : 'String'
}
