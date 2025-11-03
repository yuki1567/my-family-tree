import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { FILES } from '../core/constants.js'
import type { SetupEnvironmentOutput } from '../core/types.js'
import { PROJECT_ROOT, log } from '../core/utils.js'

export function generatePrompt(ctx: SetupEnvironmentOutput): void {
  const templatePath = path.join(PROJECT_ROOT, FILES.PROMPT.TEMPLATE)
  const outputPath = path.join(PROJECT_ROOT, FILES.PROMPT.OUTPUT)
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
  log('Claude Code用プロンプトを生成しました')
}
