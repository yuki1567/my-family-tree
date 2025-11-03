import { PutParameterCommand, SSMClient } from '@aws-sdk/client-ssm'
import { spawnSync } from 'node:child_process'
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import {
  type Ctx,
  PROJECT_ROOT,
  assertApiPort,
  assertBranchName,
  assertDbAdminPassword,
  assertDbAdminUser,
  assertDbName,
  assertDbUser,
  assertDbUserPassword,
  assertInReviewStatusId,
  assertIssueLabel,
  assertIssueNumber,
  assertIssueSlugTitle,
  assertIssueTitle,
  assertProjectId,
  assertProjectNumber,
  assertStatusFieldId,
  assertWebPort,
  assertWorktreePath,
  log,
  runCommand,
} from './context.js'

async function registerWorktreeParameters(
  issueNumber: number,
  params: Record<string, string>
): Promise<void> {
  const region = process.env['AWS_REGION']
  const pathPrefix = `/family-tree/worktree/${issueNumber}`
  const client = new SSMClient({ region })

  log(`🔐 Parameter Storeにパラメータを登録中... (Path: ${pathPrefix})`)

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

  log(
    `🔐 Parameter Store登録完了: 成功 ${successCount}件, エラー ${errorCount}件`
  )
}

export function createWorktree(ctx: Ctx): Ctx {
  assertIssueLabel(ctx)
  assertIssueNumber(ctx)
  assertIssueSlugTitle(ctx)

  runCommand('git', ['fetch', 'origin'])
  runCommand('git', ['pull', 'origin', 'main'])

  const branchName = `${ctx.gitHub.issueLabel}/${ctx.gitHub.issueNumber}-${ctx.gitHub.issueSlugTitle}`
  const worktreePath = path.resolve(PROJECT_ROOT, '..', branchName)

  runCommand('git', ['worktree', 'add', worktreePath, '-b', branchName, 'main'])
  log(`🛠 Worktreeを作成しました: ${worktreePath}`)

  return {
    ...ctx,
    gitHub: {
      ...ctx.gitHub,
      branchName,
    },
    environment: {
      ...ctx.environment,
      worktreePath,
    },
  }
}

export async function generateEnvFile(ctx: Ctx): Promise<Ctx> {
  assertIssueNumber(ctx)
  assertIssueSlugTitle(ctx)
  assertWorktreePath(ctx)
  assertBranchName(ctx)
  assertDbAdminUser(ctx)
  assertDbAdminPassword(ctx)
  assertDbUser(ctx)
  assertDbUserPassword(ctx)

  const webPort = 3000 + ctx.gitHub.issueNumber
  const apiPort = 4000 + ctx.gitHub.issueNumber
  const maxSlugLength = 50
  const truncatedSlug =
    ctx.gitHub.issueSlugTitle.length > maxSlugLength
      ? ctx.gitHub.issueSlugTitle.substring(
          0,
          ctx.gitHub.issueSlugTitle.lastIndexOf('-', maxSlugLength)
        )
      : ctx.gitHub.issueSlugTitle
  const dbName = `family_tree_${truncatedSlug.replace(/-/g, '_')}`
  const appName = `app-${ctx.gitHub.issueSlugTitle}`

  const srcClaudeLocalSettings = path.join(
    PROJECT_ROOT,
    '.claude',
    'settings.local.json'
  )
  const dstClaudeLocalSettings = path.join(
    ctx.environment.worktreePath,
    '.claude',
    'settings.local.json'
  )

  copyFileSync(srcClaudeLocalSettings, dstClaudeLocalSettings)
  log(
    `📝 Claudeローカル設定ファイルをコピーしました: ${dstClaudeLocalSettings}`
  )

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

export function createDbSchema(ctx: Ctx): void {
  assertDbName(ctx)
  assertDbAdminPassword(ctx)

  const dbName = ctx.environment.dbName
  const adminPassword = ctx.environment.dbAdminPassword

  log('🗄 データベーススキーマを作成中...')
  const result = spawnSync(
    'docker-compose',
    [
      'exec',
      '-T',
      '-e',
      `PGPASSWORD=${adminPassword}`,
      'db',
      'psql',
      '-U',
      'admin_user',
      '-d',
      'postgres',
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

  log(`🗄 DBスキーマを作成しました: ${dbName}`)
}

export function openVscode(ctx: Ctx) {
  assertWorktreePath(ctx)

  runCommand('code', [ctx.environment.worktreePath])
  log('💻 VS Codeでworktreeを開きました')
}

export function generatePrompt(ctx: Ctx) {
  assertIssueNumber(ctx)
  assertIssueTitle(ctx)
  assertBranchName(ctx)
  assertApiPort(ctx)
  assertWebPort(ctx)
  assertProjectId(ctx)
  assertProjectNumber(ctx)
  assertStatusFieldId(ctx)
  assertInReviewStatusId(ctx)

  const templatePath = path.join(
    PROJECT_ROOT,
    '.claude',
    'templates',
    'worktree-prompt.md'
  )
  const outputPath = path.join(
    PROJECT_ROOT,
    '.claude',
    'tmp',
    'generated-worktree-prompt.md'
  )
  const template = readFileSync(templatePath, 'utf-8')
  const replaced = template
    .replaceAll('{{ISSUE_NUMBER}}', String(ctx.gitHub.issueNumber))
    .replaceAll('{{ISSUE_TITLE}}', ctx.gitHub.issueTitle)
    .replaceAll('{{BRANCH_NAME}}', ctx.gitHub.branchName)
    .replaceAll('{{WEB_PORT}}', String(ctx.environment.webPort))
    .replaceAll('{{API_PORT}}', String(ctx.environment.apiPort))
    .replaceAll('{{PROJECT_NUMBER}}', String(ctx.githubProjects.projectNumber))
    .replaceAll('{{PROJECT_ID}}', ctx.githubProjects.projectId)
    .replaceAll('{{STATUS_FIELD_ID}}', ctx.githubProjects.statusFieldId)
    .replaceAll('{{IN_REVIEW_OPTION_ID}}', ctx.githubProjects.inReviewStatusId)

  writeFileSync(outputPath, replaced, 'utf-8')
  log('📝 Claude Code用プロンプトを生成しました')
}
