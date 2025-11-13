import { log, logError } from '../shared/utils.js'

import { cleanupAwsProfile } from './steps/cleanup-aws-profile.js'
import { cleanupContainer } from './steps/cleanup-container.js'
import { cleanupDatabase } from './steps/cleanup-database.js'
import { cleanupParameters } from './steps/cleanup-parameters.js'
import { closeIssue } from './steps/close-issue.js'
import { initialize } from './steps/initialize.js'
import { mergeToMain } from './steps/merge-to-main.js'
import { removeWorktree } from './steps/remove-worktree.js'

async function main() {
  const ctx = await initialize()

  mergeToMain()

  if (config) {
    cleanupDatabase(config)
    await cleanupParameters(ssmClient, issueNumber)
    cleanupAwsProfile(issueNumber)
    cleanupContainer(config)
  } else {
    log(
      'ℹ️ worktree設定が見つからないため、インフラリソースのクリーンアップをスキップします'
    )
  }

  removeWorktree(worktreeInfo)
  closeIssue(worktreeInfo)

  log('✅ post-merge処理が完了しました')
}

main().catch((error) => {
  logError(error)
  process.exit(1)
})
