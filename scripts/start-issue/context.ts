import { spawnSync } from 'node:child_process'
import path from 'node:path'

export type GitHub = {
  issueNumber?: number
  issueTitle?: string
  issueLabel?: string
  issueSlugTitle?: string
  branchName?: string
}

export type GithubProjects = {
  projectId?: string
  todoStatusId?: string
  inProgressStatusId?: string
  projectItemId?: string
}

export type Environment = {
  webPort?: number
  apiPort?: number
  dbName?: string
  dbRootPassword?: string
  dbUser?: string
  appName?: string
  worktreePath?: string
}

export type Ctx = {
  gitHub?: GitHub
  githubProjects?: GithubProjects
  cloudTranslation?: string
  environment?: Environment
}

export const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..')

function createValidationError(fieldName: string): Error {
  return new Error(`${fieldName}が定義されていません`)
}

export function assertField(condition: boolean, fieldName: string): void {
  if (!condition) {
    throw createValidationError(fieldName)
  }
}

export function assertProjectId(ctx: Ctx): asserts ctx is Ctx & {
  githubProjects: GithubProjects & { projectId: string }
} {
  assertField(isValidProjectId(ctx), 'Github ProjectのID')
}

export function assertTodoStatusId(ctx: Ctx): asserts ctx is Ctx & {
  githubProjects: GithubProjects & { todoStatusId: string }
} {
  assertField(isValidTodoStatusId(ctx), 'Github ProjectのTo DoステータスID')
}

export function assertInProgressStatusId(ctx: Ctx): asserts ctx is Ctx & {
  githubProjects: GithubProjects & { inProgressStatusId: string }
} {
  assertField(
    isValidInProgressStatusId(ctx),
    'Github ProjectのIn ProgressステータスID'
  )
}

export function assertProjectItemId(ctx: Ctx): asserts ctx is Ctx & {
  githubProjects: GithubProjects & { projectItemId: string }
} {
  assertField(isValidProjectItemId(ctx), 'Github ProjectのアイテムID')
}

export function assertIssueNumber(
  ctx: Ctx
): asserts ctx is Ctx & { gitHub: GitHub & { issueNumber: number } } {
  assertField(isValidIssueNumber(ctx), 'GitHubのIssue番号')
}

export function assertIssueTitle(
  ctx: Ctx
): asserts ctx is Ctx & { gitHub: GitHub & { issueTitle: string } } {
  assertField(isValidIssueTitle(ctx), 'Issueタイトル')
}

export function assertCloudTranslation(
  ctx: Ctx
): asserts ctx is Ctx & { cloudTranslation: string } {
  assertField(isValidcloudTranslation(ctx), 'Google TranslateのAPIキー')
}

export function assertIssueLabel(
  ctx: Ctx
): asserts ctx is Ctx & { gitHub: GitHub & { issueLabel: string } } {
  assertField(isValidIssueLabel(ctx), 'GitHubのIssueラベル')
}

export function assertIssueSlugTitle(
  ctx: Ctx
): asserts ctx is Ctx & { gitHub: GitHub & { issueSlugTitle: string } } {
  assertField(isValidIssueSlugTitle(ctx), 'スラグ化されたIssueタイトル')
}

export function assertWorktreePath(ctx: Ctx): asserts ctx is Ctx & {
  environment: Environment & { worktreePath: string }
} {
  assertField(isValidWorktreePath(ctx), 'Worktreeパス')
}

export function assertBranchName(
  ctx: Ctx
): asserts ctx is Ctx & { gitHub: GitHub & { branchName: string } } {
  assertField(isValidBranchName(ctx), 'ブランチ名')
}

export function assertDbName(
  ctx: Ctx
): asserts ctx is Ctx & { environment: Environment & { dbName: string } } {
  assertField(isValidDbName(ctx), 'DB名')
}

export function assertDbUser(
  ctx: Ctx
): asserts ctx is Ctx & { environment: Environment & { dbUser: string } } {
  assertField(isValidDbUser(ctx), 'DBユーザ名')
}

export function assertApiPort(
  ctx: Ctx
): asserts ctx is Ctx & { environment: Environment & { apiPort: number } } {
  assertField(isValidApiPort(ctx), 'APIポート')
}

export function assertWebPort(
  ctx: Ctx
): asserts ctx is Ctx & { environment: Environment & { webPort: number } } {
  assertField(isValidWebPort(ctx), 'WEBポート')
}

export function isValidProjectId(
  ctx: Ctx
): ctx is Ctx & { githubProjects: GithubProjects & { projectId: string } } {
  return typeof ctx.githubProjects?.projectId === 'string'
}

export function isValidTodoStatusId(
  ctx: Ctx
): ctx is Ctx & { githubProjects: GithubProjects & { todoStatusId: string } } {
  return typeof ctx.githubProjects?.todoStatusId === 'string'
}

export function isValidInProgressStatusId(ctx: Ctx): ctx is Ctx & {
  githubProjects: GithubProjects & { inProgressStatusId: string }
} {
  return typeof ctx.githubProjects?.inProgressStatusId === 'string'
}

export function isValidProjectItemId(ctx: Ctx): ctx is Ctx & {
  githubProjects: GithubProjects & { projectItemId: string }
} {
  return typeof ctx.githubProjects?.projectItemId === 'string'
}

export function isValidIssueNumber(
  ctx: Ctx
): ctx is Ctx & { gitHub: GitHub & { issueNumber: number } } {
  return typeof ctx.gitHub?.issueNumber === 'number'
}

export function isValidIssueTitle(
  ctx: Ctx
): ctx is Ctx & { gitHub: GitHub & { issueTitle: string } } {
  return typeof ctx.gitHub?.issueTitle === 'string'
}

export function isValidIssueLabel(
  ctx: Ctx
): ctx is Ctx & { gitHub: GitHub & { issueLabel: string } } {
  return typeof ctx.gitHub?.issueLabel === 'string'
}

export function isValidIssueSlugTitle(
  ctx: Ctx
): ctx is Ctx & { gitHub: GitHub & { issueSlugTitle: string } } {
  return typeof ctx.gitHub?.issueSlugTitle === 'string'
}

export function isValidWorktreePath(
  ctx: Ctx
): ctx is Ctx & { environment: Environment & { worktreePath: string } } {
  return typeof ctx.environment?.worktreePath === 'string'
}

export function isValidcloudTranslation(
  ctx: Ctx
): ctx is Ctx & { cloudTranslation: string } {
  return typeof ctx.cloudTranslation === 'string'
}

export function isValidDbName(
  ctx: Ctx
): ctx is Ctx & { environment: Environment & { dbName: string } } {
  return typeof ctx.environment?.dbName === 'string'
}

export function isValidDbUser(
  ctx: Ctx
): ctx is Ctx & { environment: Environment & { dbUser: string } } {
  return typeof ctx.environment?.dbUser === 'string'
}

export function isValidBranchName(
  ctx: Ctx
): ctx is Ctx & { gitHub: GitHub & { branchName: string } } {
  return typeof ctx.gitHub?.branchName === 'string'
}

export function isValidApiPort(
  ctx: Ctx
): ctx is Ctx & { environment: Environment & { apiPort: number } } {
  return typeof ctx.environment?.apiPort === 'number'
}

export function isValidWebPort(
  ctx: Ctx
): ctx is Ctx & { environment: Environment & { webPort: number } } {
  return typeof ctx.environment?.webPort === 'number'
}

export function runCommand(
  command: string,
  args: string[],
  env?: NodeJS.ProcessEnv
): string {
  const result = spawnSync(command, args, {
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
    cwd: PROJECT_ROOT,
    env,
  })

  if (result.status !== 0) {
    const stderr = result.stderr?.toString().trim() ?? ''
    throw new Error(`${command} ${args.join(' ')} failed: ${stderr}`)
  }

  return result.stdout?.toString().trim() ?? ''
}

export function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`環境変数${key}が設定されていません`)
  }
  return value
}

export function log(message: string) {
  const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0]
  console.log(`[${timestamp}] ${message}`)
}

export function logError(message: string) {
  const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0]
  console.error(`[${timestamp}] ❌ ERROR: ${message}`)
}
