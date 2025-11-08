import { logError } from './core/utils.js'
import { createAwsProfile } from './modules/create-aws-profile.js'
import { createDbSchema } from './modules/create-db-schema.js'
import { createWorktree } from './modules/create-worktree.js'
import { fetchIssue } from './modules/fetch-issue.js'
import { generatePrompt } from './modules/generate-prompt.js'
import { generateSlugTitle } from './modules/generate-slug-title.js'
import { initializeContext } from './modules/initialize-context.js'
import { moveIssueToInProgress } from './modules/move-issue-to-in-progress.js'
import { openVscode } from './modules/open-vscode.js'
import { setupEnvironment } from './modules/setup-environment.js'

async function main() {
  const initializeContextCtx = await initializeContext()
  const fetchIssueCtx = await fetchIssue(initializeContextCtx)
  await moveIssueToInProgress(fetchIssueCtx)
  const generateSlugTitleCtx = await generateSlugTitle(fetchIssueCtx)
  const createWorktreeCtx = createWorktree(generateSlugTitleCtx)
  const setupEnvironmentCtx = await setupEnvironment(createWorktreeCtx)
  const createAwsProfileCtx = createAwsProfile(setupEnvironmentCtx)
  createDbSchema(createAwsProfileCtx)
  generatePrompt(createAwsProfileCtx)
  openVscode(createAwsProfileCtx)
}

main().catch((error) => {
  logError(error)
  process.exit(1)
})
