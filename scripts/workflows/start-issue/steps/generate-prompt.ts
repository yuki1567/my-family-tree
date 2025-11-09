import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { FILES } from '../../../shared/constants.js'
import { PROJECT_ROOT, log } from '../../../shared/utils.js'

import type { CreateAwsProfileOutput } from './create-aws-profile.js'

export function generatePrompt(ctx: CreateAwsProfileOutput): void {
  const templatePath = path.join(PROJECT_ROOT, FILES.PROMPT.TEMPLATE)
  const outputPath = path.join(PROJECT_ROOT, FILES.PROMPT.OUTPUT)

  const template = readFileSync(templatePath, 'utf-8')

  const prompt = template
    .replace(/\{\{ISSUE_NUMBER\}\}/g, String(ctx.gitHub.issueNumber))
    .replace(/\{\{ISSUE_SLUG_TITLE\}\}/g, ctx.gitHub.issueSlugTitle)
    .replace(/\{\{ISSUE_LABEL\}\}/g, ctx.gitHub.issueLabel)
    .replace(/\{\{BRANCH_NAME\}\}/g, ctx.gitHub.branchName)
    .replace(/\{\{WORKTREE_PATH\}\}/g, ctx.environment.worktreePath)
    .replace(/\{\{WEB_PORT\}\}/g, String(ctx.environment.webPort))
    .replace(/\{\{API_PORT\}\}/g, String(ctx.environment.apiPort))
    .replace(/\{\{DB_NAME\}\}/g, ctx.environment.dbName)
    .replace(/\{\{APP_NAME\}\}/g, ctx.environment.appName)

  writeFileSync(outputPath, prompt, 'utf-8')

  log(`プロンプトを生成しました: ${outputPath}`)
}
