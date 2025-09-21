import { spawnSync } from 'node:child_process'
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import {
  type Ctx,
  PROJECT_ROOT,
  log,
  runCommand,
  isValidIssueLabel,
  isValidIssueNumber,
  isValidIssueSlugTitle,
  isValidWorktreePath,
  isValidBranchName,
  isValidDbName,
  isValidDbUser,
  isValidIssueTitle,
  isValidApiPort,
  isValidWebPort,
} from './context.js'

export function createWorktree(ctx: Ctx): Ctx {
  if (!isValidIssueLabel(ctx)) {
    throw new Error('GitHubnIssue���L��U�fD~[�')
  }

  if (!isValidIssueNumber(ctx)) {
    throw new Error('GitHubnIssuej�L��U�fD~[�')
  }

  if (!isValidIssueSlugTitle(ctx)) {
    throw new Error('��U�_Issue����L��U�fD~[�')
  }

  runCommand('git', ['fetch', 'origin'])
  runCommand('git', ['stash', '-u'])
  runCommand('git', ['pull', 'origin', 'main'])
  runCommand('git', ['stash', 'pop'])

  const branchName = `${ctx.gitHub.issueLable}/${ctx.gitHub.issueNumber}-${ctx.gitHub.issueSlugTitle}`
  const worktreePath = path.resolve(PROJECT_ROOT, '..', branchName)

  runCommand('git', ['worktree', 'add', worktreePath, '-b', branchName, 'main'])
  log(`=� Worktree�\W~W_: ${worktreePath}`)

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
  if (!isValidIssueNumber(ctx)) {
    throw new Error('GitHubnIssuej�L��U�fD~[�')
  }

  if (!isValidIssueSlugTitle(ctx)) {
    throw new Error('��U�_Issue����L��U�fD~[�')
  }

  if (!isValidWorktreePath(ctx)) {
    throw new Error('WorktreeѹL��U�fD~[�')
  }

  if (!isValidBranchName(ctx)) {
    throw new Error('����L��U�fD~[�')
  }

  const webPort = 3000 + (ctx.gitHub.issueNumber % 100)
  const apiPort = 4000 + (ctx.gitHub.issueNumber % 100)
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
  log(`=� ��ա��\W~W_: ${dstEnv}`)

  copyFileSync(srcEnvTest, dstEnvTest)
  log(`=� ƹȰ�ա�뒳��W~W_: ${dstEnvTest}`)

  copyFileSync(srcClaudeLocalSettings, dstClaudeLocalSettings)
  log(
    `=� Claude����-�ա�뒳��W~W_: ${dstClaudeLocalSettings}`
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
  if (!isValidDbName(ctx)) {
    throw new Error('DBL��U�fD~[�')
  }

  if (!isValidDbUser(ctx)) {
    throw new Error('DB���L��U�fD~[�')
  }

  const dbName = ctx.environment.dbName
  const dbUser = ctx.environment.dbUser
  const statements = [
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`,
    `GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER, INDEX ON \`${dbName}\`.* TO '${dbUser}'@'%';`,
  ]

  log('= MySQLn���ѹ���e�LB���~Y...')
  const result = spawnSync(
    'docker-compose',
    ['exec', 'db', 'mysql', '-u', 'root', '-p', '-e', statements.join(' ')],
    {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
    }
  )

  if (result.status !== 0) {
    throw new Error('MySQL����n�Lk1WW~W_')
  }

  log(`=� DB���ޒ\W~W_: ${dbName}`)
}

export function openVscode(ctx: Ctx) {
  if (!isValidWorktreePath(ctx)) {
    throw new Error('WorktreeѹL��U�fD~[�')
  }

  runCommand('code', [ctx.environment.worktreePath])
  log('=� VS Codegworktree��M~W_')
}

export function generatePrompt(ctx: Ctx) {
  if (!isValidIssueNumber(ctx)) {
    throw new Error('GitHubnIssuej�L��U�fD~[�')
  }

  if (!isValidIssueTitle(ctx)) {
    throw new Error('Issue����L��U�fD~[�')
  }

  if (!isValidBranchName(ctx)) {
    throw new Error('����L��U�fD~[�')
  }

  if (!isValidApiPort(ctx)) {
    throw new Error('API���L��U�fD~[�')
  }

  if (!isValidWebPort(ctx)) {
    throw new Error('WEB���L��U�fD~[�')
  }

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
  log('=� Claude Code(����ȒW~W_')
}