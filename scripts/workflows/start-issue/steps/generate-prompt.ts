import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { FILES } from '../../shared/constants.js'
import type { WorkflowContext } from '../../shared/types.js'
import { PROJECT_ROOT, log } from '../../shared/utils.js'

export function generatePrompt(ctx: WorkflowContext): void {
  const templatePath = path.join(PROJECT_ROOT, FILES.PROMPT.TEMPLATE)
  const outputPath = path.join(PROJECT_ROOT, FILES.PROMPT.OUTPUT)

  const template = readFileSync(templatePath, 'utf-8')

  const prompt = template
    .replace(/\{\{ISSUE_NUMBER\}\}/g, String(ctx.githubApi.issueData.number))
    .replace(/\{\{ISSUE_SLUG_TITLE\}\}/g, ctx.worktreeEnvironment.slugTitle)
    .replace(/\{\{ISSUE_LABEL\}\}/g, ctx.githubApi.issueData.label)
    .replace(/\{\{BRANCH_NAME\}\}/g, ctx.worktreeEnvironment.branchName)
    .replace(/\{\{WORKTREE_PATH\}\}/g, ctx.worktreeEnvironment.worktreePath)
    .replace(/\{\{WEB_PORT\}\}/g, String(ctx.worktreeEnvironment.webPort))
    .replace(/\{\{API_PORT\}\}/g, String(ctx.worktreeEnvironment.apiPort))
    .replace(/\{\{DB_NAME\}\}/g, ctx.worktreeEnvironment.databaseName)
    .replace(/\{\{APP_NAME\}\}/g, ctx.worktreeEnvironment.appName)

  writeFileSync(outputPath, prompt, 'utf-8')

  log(`プロンプトを生成しました: ${outputPath}`)
}
