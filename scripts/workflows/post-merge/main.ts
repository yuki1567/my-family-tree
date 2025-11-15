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

  log('📋 Step 1/5: パラメータを取得中...')
  const parameterStore = await ParameterStore.create(
    AWS.PARAMETER_PATH.WORKTREE,
    REQUIRED_WORKTREE_PARAMETERS
  )

  log('🔄 Step 2/5: Worktree情報を構築し、mainブランチにマージ中...')
  const issueNumber = parseIssueNumber(process.argv[2])
  const worktreeConfig = buildWorktreeConfig(issueNumber)

  const git = new Git(worktreeConfig.branchName, worktreeConfig.worktreePath)

  git.mergeToMain()

  log('🧹 Step 3/5: インフラストラクチャをクリーンアップ中...')
  await cleanupInfrastructure(
    parameterStore,
    worktreeConfig.branchName,
    worktreeConfig.databaseName
  )

  log('🗑️  Step 4/5: AWSリソースをクリーンアップ中...')
  await cleanupAwsResources(parameterStore, worktreeConfig.branchName)

  log('✨ Step 5/5: Worktreeとブランチを削除し、Issueをクローズ中...')
  cleanupWorktree(git)

  GitHubApi.closeIssue(issueNumber)

  log('✅ post-merge処理が完了しました')
}

main().catch((error) => {
  logError(error)
  process.exit(1)
})
