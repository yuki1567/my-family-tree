import { SSMClient } from '@aws-sdk/client-ssm'

import { AWS } from '../../shared/constants.js'
import { log, logError } from '../../shared/utils.js'

import { cleanupAwsProfile } from './steps/cleanup-aws-profile.js'
import { cleanupContainer } from './steps/cleanup-container.js'
import { cleanupDatabase } from './steps/cleanup-database.js'
import { cleanupParameters } from './steps/cleanup-parameters.js'
import { closeIssue } from './steps/close-issue.js'
import { fetchWorktreeInfo } from './steps/fetch-worktree-info.js'
import { loadWorktreeConfig } from './steps/load-worktree-config.js'
import { mergeToMain } from './steps/merge-to-main.js'
import { removeWorktree } from './steps/remove-worktree.js'

async function main() {
  const issueNumberArg = process.argv[2]

  if (!issueNumberArg) {
    throw new Error('issue番号を指定してください')
  }

  const issueNumber = Number.parseInt(issueNumberArg, 10)
  if (Number.isNaN(issueNumber)) {
    throw new Error(`無効なissue番号です: ${issueNumberArg}`)
  }

  const ssmClient = new SSMClient({ region: AWS.REGION })

  const worktreeInfo = fetchWorktreeInfo(issueNumber)
  const config = await loadWorktreeConfig(ssmClient, issueNumber)

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
