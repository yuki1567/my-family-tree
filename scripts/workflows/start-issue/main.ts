import { logError } from '../shared/utils.js'

import { createGitWorktree } from './steps/create-worktree.js'
import { fetchIssue } from './steps/fetch-issue.js'
import { generatePrompt } from './steps/generate-prompt.js'
import { generateSlugTitle } from './steps/generate-slug-title.js'
import { initialize } from './steps/initialize.js'
import { moveIssueToInProgress } from './steps/move-issue-to-in-progress.js'
import { openVscode } from './steps/open-vscode.js'
import { setupAwsProfile } from './steps/setup-aws-profile.js'
import { setupDatabase } from './steps/setup-database.js'
import { setupEnvironment } from './steps/setup-environment.js'

async function main() {
  const ctx = await initialize()

  await fetchIssue(ctx)
  await moveIssueToInProgress(ctx)
  await generateSlugTitle(ctx)
  createGitWorktree(ctx)
  await setupEnvironment(ctx)
  setupAwsProfile(ctx)
  setupDatabase(ctx)
  generatePrompt(ctx)
  openVscode(ctx)
}

main().catch((error) => {
  logError(error)
  process.exit(1)
})
