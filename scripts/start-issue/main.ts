import { logError } from './core/utils.js'
import { createDbSchema } from './modules/database.js'
import { generateEnvFile, generatePrompt } from './modules/env-generator.js'
import {
  fetchIssue,
  generateSlugTitle,
  loadEnv,
  moveIssueToInProgress,
} from './modules/issue-service.js'
import { openVscode } from './modules/vscode.js'
import { createWorktree } from './modules/worktree.js'

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
