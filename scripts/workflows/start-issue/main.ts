import { logError } from '../shared/utils.js'

import { createAwsProfile } from './steps/create-aws-profile.js'
import { createDatabase } from './steps/create-database.js'
import { createWorktree } from './steps/create-worktree.js'
import { fetchIssue } from './steps/fetch-issue.js'
import { generatePrompt } from './steps/generate-prompt.js'
import { generateSlugTitle } from './steps/generate-slug-title.js'
import { initialize } from './steps/initialize.js'
import { openVscode } from './steps/open-vscode.js'
import { setupEnvironment } from './steps/setup-environment.js'

async function main() {
  const initializeCtx = await initialize()
  const fetchIssueCtx = await fetchIssue(initializeCtx)
  const generateSlugTitleCtx = await generateSlugTitle(fetchIssueCtx)
  const createWorktreeCtx = createWorktree(generateSlugTitleCtx)
  const setupEnvironmentCtx = await setupEnvironment(createWorktreeCtx)
  const createAwsProfileCtx = createAwsProfile(setupEnvironmentCtx)
  createDatabase(createAwsProfileCtx)
  generatePrompt(createAwsProfileCtx)
  await openVscode(createAwsProfileCtx)
}

main().catch((error) => {
  logError(error)
  process.exit(1)
})
