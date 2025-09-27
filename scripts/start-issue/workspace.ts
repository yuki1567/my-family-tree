import { spawnSync } from 'node:child_process'
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import {
  type Ctx,
  PROJECT_ROOT,
  assertApiPort,
  assertBranchName,
  assertDbName,
  assertDbUser,
  assertIssueLabel,
  assertIssueNumber,
  assertIssueSlugTitle,
  assertIssueTitle,
  assertWebPort,
  assertWorktreePath,
  log,
  runCommand,
} from './context.js'

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
  const dbName = `family_tree_${ctx.gitHub.issueSlugTitle.replace(/-/g, '_')}`
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
  assertDbUser(ctx)

  const dbName = ctx.environment.dbName
  const dbUser = ctx.environment.dbUser
  const statements = [
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`,
    `GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER, INDEX ON \`${dbName}\`.* TO '${dbUser}'@'%';`,
  ]

  log('🔐 MySQLのルートパスワード入力が求められます...')
  const result = spawnSync(
    'docker-compose',
    ['exec', 'db', 'mysql', '-u', 'root', '-p', '-e', statements.join(' ')],
    {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
    }
  )

  if (result.status !== 0) {
    throw new Error('MySQLコマンドの実行に失敗しました')
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

  writeFileSync(outputPath, replaced, 'utf-8')
  log('📝 Claude Code用プロンプトを生成しました')
}
