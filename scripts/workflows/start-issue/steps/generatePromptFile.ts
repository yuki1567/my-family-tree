import { readFileSync, writeFileSync } from 'fs'
import path from 'path'

import type { GitHubApi } from 'scripts/workflows/lib/GitHubApi.js'
import { FILES } from 'scripts/workflows/shared/constants.js'
import { WorktreeConfig } from 'scripts/workflows/shared/types.js'
import { PROJECT_ROOT } from 'scripts/workflows/shared/utils.js'

export function generatePromptFile(
  githubApi: GitHubApi,
  config: WorktreeConfig,
  awsProfileName: string
): void {
  const templatePath = path.join(PROJECT_ROOT, FILES.PROMPT.TEMPLATE)
  const outputPath = path.join(PROJECT_ROOT, FILES.PROMPT.OUTPUT)
  const template = readFileSync(templatePath, 'utf-8')

  const prompt = template
    .replace(/\{\{ISSUE_NUMBER\}\}/g, String(githubApi.issue.number))
    .replace(/\{\{ISSUE_TITLE\}\}/g, githubApi.issue.title)
    .replace(/\{\{ISSUE_LABEL\}\}/g, githubApi.issue.label)
    .replace(/\{\{BRANCH_NAME\}\}/g, config.branchName)
    .replace(/\{\{AWS_PROFILE_NAME\}\}/g, awsProfileName)
    .replace(/\{\{WEB_PORT\}\}/g, String(config.webPort))
    .replace(/\{\{API_PORT\}\}/g, String(config.apiPort))
    .replace(/\{\{PROJECT_ID\}\}/g, githubApi.projectId)
    .replace(/\{\{STATUS_FIELD_ID\}\}/g, githubApi.statusFieldId)
    .replace(/\{\{IN_REVIEW_STATUS_ID\}\}/g, githubApi.statusIds.inReview)

  writeFileSync(outputPath, prompt, 'utf-8')
}
