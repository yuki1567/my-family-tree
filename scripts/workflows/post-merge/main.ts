import { log, logError } from '../shared/utils.js'

import { cleanupAwsProfile } from './steps/cleanup-aws-profile.js'
import { cleanupContainer } from './steps/cleanup-container.js'
import { cleanupDatabase } from './steps/cleanup-database.js'
import { cleanupParameters } from './steps/cleanup-parameters.js'
import { githubCloseIssue } from './steps/close-issue.js'
import { initialize } from './steps/initialize.js'
import { gitMergeToMain } from './steps/merge-to-main.js'
import { gitRemoveWorktree } from './steps/remove-worktree.js'

async function main() {
  const ctx = await initialize()

  gitMergeToMain()
  cleanupDatabase(ctx)
  await cleanupParameters(ctx)
  cleanupAwsProfile(ctx)
  cleanupContainer(ctx)
  gitRemoveWorktree(ctx)
  githubCloseIssue(ctx)

  log('✅ post-merge処理が完了しました')
}

main().catch((error) => {
  logError(error)
  process.exit(1)
})
