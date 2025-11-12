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
  const ctx = await initialize()

  await fetchIssue(ctx)
  await generateSlugTitle(ctx)
  await createWorktree(ctx)
  await setupEnvironment(ctx)
  await createAwsProfile(ctx)
  await createDatabase(ctx)
  await generatePrompt(ctx)
  await openVscode(ctx)
}

main().catch((error) => {
  logError(error)
  process.exit(1)
})
