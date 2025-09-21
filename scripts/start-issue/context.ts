import { spawnSync } from 'node:child_process'
import { EOL } from 'node:os'
import path from 'node:path'

export type GitHub = {
  issueNumber?: number
  issueTitle?: string
  issueLable?: string
  issueSlugTitle?: string
  branchName?: string
}

export type ZenHub = {
  token?: string
  endPoint?: string
  todoPipelineId?: string
  doingPipelineId?: string
  zenHubIssueId?: string
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
  zenHub?: ZenHub
  cloudTranslation?: string
  environment?: Environment
}

export type SearchResponse = {
  searchIssuesByPipeline: {
    nodes: Array<{
      id: string
      number: number
      title: string
      labels: { nodes: Array<{ name: string }> }
    }>
  }
}

export const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..')

export function isValidZenHubEndPoint(
  ctx: Ctx
): ctx is Ctx & { zenHub: ZenHub & { endPoint: string } } {
  return typeof ctx.zenHub?.endPoint === 'string'
}

export function isValidZenHubTodoPipelineId(
  ctx: Ctx
): ctx is Ctx & { zenHub: ZenHub & { todoPipelineId: string } } {
  return typeof ctx.zenHub?.todoPipelineId === 'string'
}

export function isValidZenHubToken(
  ctx: Ctx
): ctx is Ctx & { zenHub: ZenHub & { token: string } } {
  return typeof ctx.zenHub?.token === 'string'
}

export function isValidZenHubIssueId(
  ctx: Ctx
): ctx is Ctx & { zenHub: ZenHub & { zenHubIssueId: string } } {
  return typeof ctx.zenHub?.zenHubIssueId === 'string'
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
): ctx is Ctx & { gitHub: GitHub & { issueLable: string } } {
  return typeof ctx.gitHub?.issueLable === 'string'
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

export function isValidDbName(ctx: Ctx): ctx is Ctx & { dbName: string } {
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

export function runCommand(command: string, args: string[]): string {
  const result = spawnSync(command, args, {
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
    cwd: PROJECT_ROOT,
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
    throw new Error(`°ƒ	p${key}L-šUŒfD~[“`)
  }
  return value
}

export function log(message: string) {
  const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0]
  process.stdout.write(`[${timestamp}] ${message}${EOL}`)
}

export function logError(message: string) {
  const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0]
  process.stderr.write(`[${timestamp}] L ERROR: ${message}${EOL}`)
}