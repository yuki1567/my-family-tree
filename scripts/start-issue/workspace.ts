import { spawnSync } from 'node:child_process'
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import {
  type Ctx,
  PROJECT_ROOT,
  assertApiPort,
  assertBranchName,
  assertDbAdminPassword,
  assertDbName,
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

function registerWorktreeParameters(
  issueNumber: number,
  params: Record<string, string>
): void {
  const region = process.env['AWS_REGION'] || 'ap-northeast-1'
  const pathPrefix = `/family-tree/worktree/${issueNumber}`

  log(`🔐 Parameter Storeにパラメータを登録中... (Path: ${pathPrefix})`)

  let successCount = 0
  let errorCount = 0

  for (const [key, value] of Object.entries(params)) {
    const paramName = `${pathPrefix}/${key}`
    const paramType = key.includes('secret') || key.includes('password') || key.includes('url')
      ? 'SecureString'
      : 'String'

    try {
      const result = spawnSync(
        'aws',
        [
          'ssm',
          'put-parameter',
          '--name',
          paramName,
          '--value',
          value,
          '--type',
          paramType,
          '--overwrite',
          '--region',
          region,
        ],
        {
          encoding: 'utf-8',
          stdio: ['ignore', 'pipe', 'pipe'],
        }
      )

      if (result.status === 0) {
        log(`  ✓ ${key} を登録しました (Type: ${paramType})`)
        successCount++
      } else {
        log(`  ✗ ${key} の登録に失敗しました: ${result.stderr}`)
        errorCount++
      }
    } catch (error) {
      log(`  ✗ ${key} の登録中にエラーが発生しました: ${error}`)
      errorCount++
    }
  }

  log(
    `🔐 Parameter Store登録完了: 成功 ${successCount}件, エラー ${errorCount}件`
  )

  if (errorCount > 0) {
    log(
      '⚠️  一部のパラメータ登録に失敗しました。AWS認証情報を確認してください。'
    )
  }
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

export function generateEnvFile(ctx: Ctx): Ctx {
  assertIssueNumber(ctx)
  assertIssueSlugTitle(ctx)
  assertWorktreePath(ctx)
  assertBranchName(ctx)

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
  const jwtSecret = `worktree_jwt_${ctx.gitHub.issueNumber}_${Date.now()}`

  const srcEnvExample = path.join(PROJECT_ROOT, '.env.example')
  const srcEnvTest = path.join(PROJECT_ROOT, '.env.test')
  const srcClaudeLocalSettings = path.join(
    PROJECT_ROOT,
    '.claude',
    'settings.local.json'
  )

  const dstEnv = path.join(ctx.environment.worktreePath, '.env')
  const dstEnvTest = path.join(ctx.environment.worktreePath, '.env.test')
  const dstClaudeLocalSettings = path.join(
    ctx.environment.worktreePath,
    '.claude',
    'settings.local.json'
  )

  const envContent = readFileSync(srcEnvExample, 'utf-8')
    .replaceAll('{{BRANCH_NAME}}', ctx.gitHub.branchName)
    .replaceAll('{{ISSUE_NUMBER}}', String(ctx.gitHub.issueNumber))
    .replaceAll('{{APP_NAME}}', appName)
    .replaceAll('{{WEB_PORT}}', String(webPort))
    .replaceAll('{{API_PORT}}', String(apiPort))
    .replaceAll('{{DB_NAME}}', dbName)
    .replaceAll('{{JWT_SECRET}}', jwtSecret)

  writeFileSync(dstEnv, envContent)
  log(`📝 環境ファイルを作成しました: ${dstEnv}`)

  copyFileSync(srcEnvTest, dstEnvTest)
  log(`📝 テスト環境ファイルをコピーしました: ${dstEnvTest}`)

  copyFileSync(srcClaudeLocalSettings, dstClaudeLocalSettings)
  log(
    `📝 Claudeローカル設定ファイルをコピーしました: ${dstClaudeLocalSettings}`
  )

  const databaseUrl = `postgresql://family_tree_user:${envContent.match(/DATABASE_PASSWORD=(.+)/)?.[1] || 'password'}@db:5432/${dbName}`
  const databaseAdminUrl = `postgresql://admin_user:${envContent.match(/DATABASE_ADMIN_PASSWORD=(.+)/)?.[1] || 'admin_password'}@db:5432/postgres`

  registerWorktreeParameters(ctx.gitHub.issueNumber, {
    'database-url': databaseUrl,
    'database-admin-url': databaseAdminUrl,
    'jwt-secret': jwtSecret,
    'node-env': 'development',
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

  const cleanEnv = { ...process.env }
  delete cleanEnv['WEB_PORT']
  delete cleanEnv['API_PORT']
  delete cleanEnv['APP_NAME']
  delete cleanEnv['COMPOSE_PROJECT_NAME']
  delete cleanEnv['DATABASE_URL']
  delete cleanEnv['DATABASE_ADMIN_URL']
  delete cleanEnv['DATABASE_NAME']
  delete cleanEnv['JWT_SECRET']

  runCommand('code', [ctx.environment.worktreePath], cleanEnv)
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
