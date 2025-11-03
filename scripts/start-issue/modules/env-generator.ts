import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { CONFIG } from '../core/config.js'
import type { Ctx } from '../core/types.js'
import { PROJECT_ROOT, log } from '../core/utils.js'
import {
  assertApiPort,
  assertBranchName,
  assertDbAdminPassword,
  assertDbAdminUser,
  assertDbUser,
  assertDbUserPassword,
  assertInReviewStatusId,
  assertIssueNumber,
  assertIssueSlugTitle,
  assertIssueTitle,
  assertProjectId,
  assertProjectNumber,
  assertStatusFieldId,
  assertWebPort,
  assertWorktreePath,
} from '../core/validators.js'

import { registerWorktreeParameters } from './parameter-store.js'

export async function generateEnvFile(ctx: Ctx): Promise<Ctx> {
  assertIssueNumber(ctx)
  assertIssueSlugTitle(ctx)
  assertWorktreePath(ctx)
  assertBranchName(ctx)
  assertDbAdminUser(ctx)
  assertDbAdminPassword(ctx)
  assertDbUser(ctx)
  assertDbUserPassword(ctx)

  const webPort = CONFIG.ports.webBase + ctx.gitHub.issueNumber
  const apiPort = CONFIG.ports.apiBase + ctx.gitHub.issueNumber
  const truncatedSlug =
    ctx.gitHub.issueSlugTitle.length > CONFIG.database.maxSlugLength
      ? ctx.gitHub.issueSlugTitle.substring(
          0,
          ctx.gitHub.issueSlugTitle.lastIndexOf(
            '-',
            CONFIG.database.maxSlugLength
          )
        )
      : ctx.gitHub.issueSlugTitle
  const dbName = `${CONFIG.database.namePrefix}${truncatedSlug.replace(/-/g, '_')}`
  const appName = `app-${ctx.gitHub.issueSlugTitle}`

  const srcClaudeLocalSettings = path.join(
    PROJECT_ROOT,
    CONFIG.files.claudeLocalSettings.src
  )
  const dstClaudeLocalSettings = path.join(
    ctx.environment.worktreePath,
    CONFIG.files.claudeLocalSettings.src
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

  const templatePath = path.join(PROJECT_ROOT, CONFIG.files.prompt.template)
  const outputPath = path.join(PROJECT_ROOT, CONFIG.files.prompt.output)
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
