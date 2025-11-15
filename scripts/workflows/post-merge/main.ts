import { Git } from '../lib/Git.js'
import { PARAMETER_KEYS } from '../shared/constants.js'
import { log, logError } from '../shared/utils.js'

import { buildWorktreeConfig } from './steps/buildWorktreeConfig.js'
import { cleanupAwsResources } from './steps/cleanupAwsResources.js'
import { cleanupInfrastructure } from './steps/cleanupInfrastructure.js'
import { cleanupWorktree } from './steps/cleanupWorktree.js'
import { generateSlugFromIssueTitle } from './steps/generateSlugFromIssueTitle.js'
import { initialize } from './steps/initialize.js'

async function main() {
  log('🚀 post-mergeワークフローを開始します')

  log('📋 Step 1/5: Issue情報を取得中...')
  const { parameterStore, gitHubApi } = await initialize()

  log('🔄 Step 2/5: mainブランチにマージ中...')
  const slugTitle = await generateSlugFromIssueTitle(
    gitHubApi.issue.title,
    parameterStore.getParameter(PARAMETER_KEYS.GOOGLE_TRANSLATE_API_KEY)
  )

  const worktreeConfig = buildWorktreeConfig(
    gitHubApi.issue.number,
    gitHubApi.issue.label,
    slugTitle
  )
  const git = new Git(worktreeConfig.branchName, worktreeConfig.worktreePath)
  git.mergeToMain()

  log('🧹 Step 3/5: インフラストラクチャをクリーンアップ中...')
  await cleanupInfrastructure(slugTitle, parameterStore)

  log('🗑️  Step 4/5: AWSリソースをクリーンアップ中...')
  cleanupAwsResources(parameterStore, gitHubApi.issue.number)

  log('✨ Step 5/5: Worktreeとブランチを削除し、Issueをクローズ中...')
  cleanupWorktree(git)

  gitHubApi.closeIssue()

  log('✅ post-merge処理が完了しました')
}

main().catch((error) => {
  logError(error)
  process.exit(1)
})
