import { logError } from './core/utils.js'
import { createDbSchema } from './modules/create-db-schema.js'
import { createWorktree } from './modules/create-worktree.js'
import { fetchIssue } from './modules/fetch-issue.js'
import { generateEnvFile } from './modules/generate-env-file.js'
import { generatePrompt } from './modules/generate-prompt.js'
import { generateSlugTitle } from './modules/generate-slug-title.js'
import { loadEnv } from './modules/load-env.js'
import { moveIssueToInProgress } from './modules/move-issue-to-in-progress.js'
import { openVscode } from './modules/open-vscode.js'

async function main() {
  const loadEnvCtx = await loadEnv()
  const fetchIssueCtx = await fetchIssue(loadEnvCtx)
  await moveIssueToInProgress(fetchIssueCtx)
  const generateSlugTitleCtx = await generateSlugTitle(fetchIssueCtx)
  const createWorktreeCtx = createWorktree(generateSlugTitleCtx)
  const generateEnvFileCtx = await generateEnvFile(createWorktreeCtx)
  createDbSchema(generateEnvFileCtx)
  openVscode(generateEnvFileCtx)
  generatePrompt(generateEnvFileCtx)
}

main().catch((error) => {
  logError(error.message)
  process.exit(1)
})
