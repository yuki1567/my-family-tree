import { Git } from '../lib/Git.js'
import { GitHubApi } from '../lib/GitHubApi.js'
import { ParameterStore } from '../lib/ParameterStore.js'
import { AWS, REQUIRED_WORKTREE_PARAMETERS } from '../shared/constants.js'
import { buildWorktreeConfig } from '../shared/steps/buildWorktreeConfig.js'
import { log, logError, parseIssueNumber } from '../shared/utils.js'

import { cleanupAwsResources } from './steps/cleanupAwsResources.js'
import { cleanupInfrastructure } from './steps/cleanupInfrastructure.js'
import { cleanupWorktree } from './steps/cleanupWorktree.js'

async function main() {
  log('🚀 post-mergeワークフローを開始します')

  log('📋 Step 1/4: Issue番号を解析中...')
  const issueNumber = parseIssueNumber(process.argv[2])

  log('📋 Step 2/4: パラメータを取得中...')
  const parameterStore = await ParameterStore.create(
    `${AWS.PARAMETER_PATH.WORKTREE}/${issueNumber}`,
    REQUIRED_WORKTREE_PARAMETERS
  )

  log('🔄 Step 3/4: Worktree情報を構築し、mainブランチにマージ中...')
  const worktreeConfig = buildWorktreeConfig(issueNumber)
  const git = new Git(worktreeConfig.branchName, worktreeConfig.worktreePath)
  git.mergeToMain()

  log('🧹 Step 4/4: クリーンアップ処理を並列実行中...')
  await Promise.all([
    cleanupInfrastructure(
      parameterStore,
      worktreeConfig.branchName,
      worktreeConfig.databaseName
    ),
    cleanupAwsResources(parameterStore, worktreeConfig.branchName),
    cleanupWorktree(git),
    GitHubApi.closeIssue(issueNumber),
  ])

  log('✅ post-merge処理が完了しました')
}

main().catch((error) => {
  logError(error)
  process.exit(1)
})
