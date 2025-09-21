import { logError } from './context.js'
import { loadEnv, fetchIssue, moveIssueToDoing, generateSlugTitle } from './issue-service.js'
import { createWorktree, generateEnvFile, createDbSchema, openVscode, generatePrompt } from './workspace.js'

async function main() {
  const loadEnvCtx = loadEnv()
  const fetchIssueCtx = await fetchIssue(loadEnvCtx)
  await moveIssueToDoing(fetchIssueCtx)
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