import { logError } from './context.js'
import {
  fetchIssue,
  generateSlugTitle,
  loadEnv,
  moveIssueToInProgress,
} from './issue-service.js'
import {
  createDbSchema,
  createWorktree,
  generateEnvFile,
  generatePrompt,
  openVscode,
} from './workspace.js'

async function main() {
  const loadEnvCtx = await loadEnv()
  const fetchIssueCtx = await fetchIssue(loadEnvCtx)
  await moveIssueToInProgress(fetchIssueCtx)
  const generateSlugTitleCtx = await generateSlugTitle(fetchIssueCtx)
  const createWorktreeCtx = createWorktree(generateSlugTitleCtx)
  const generateEnvFileCtx = generateEnvFile(createWorktreeCtx)
  createDbSchema(generateEnvFileCtx)
  openVscode(generateEnvFileCtx)
  generatePrompt(generateEnvFileCtx)
}

main().catch((error) => {
  logError(error.message)
  process.exit(1)
})
