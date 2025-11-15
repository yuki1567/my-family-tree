import { exec } from 'node:child_process'

import { AwsProfile } from '../lib/AwsProfile.js'
import { Database } from '../lib/Database.js'
import { DockerContainer } from '../lib/DockerContainer.js'
import { Git } from '../lib/Git.js'
import { AWS, PARAMETER_KEYS } from '../shared/constants.js'
import { log, logError } from '../shared/utils.js'

import { buildWorktreeConfig } from './steps/buildWorktreeConfig.js'
import { generatePromptFile } from './steps/generatePromptFile.js'
import { generateSlugFromIssueTitle } from './steps/generateSlugFromIssueTitle.js'
import { initialize } from './steps/initialize.js'
import { setupInfrastructure } from './steps/setupInfrastructure.js'
import { setupWorktreeEnvironment } from './steps/setupWorktreeEnvironment.js'

async function main() {
  log('🚀 start-issueワークフローを開始します')

  log('📋 Step 1/5: GitHub Issue情報を取得中...')
  const { parameterStore, gitHubApi } = await initialize()

  log('🔄 Step 2/5: Issue操作を実行中...')
  gitHubApi.assignToCurrentUser()
  gitHubApi.moveToInProgress()

  log('🏗️  Step 3/5: Worktree環境を構築中...')
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
  const database = new Database(
    slugTitle,
    parameterStore.getParameter(PARAMETER_KEYS.DATABASE_ADMIN_USER),
    parameterStore.getParameter(PARAMETER_KEYS.DATABASE_ADMIN_PASSWORD),
    parameterStore.getParameter(PARAMETER_KEYS.DATABASE_USER),
    parameterStore.getParameter(PARAMETER_KEYS.DATABASE_USER_PASSWORD)
  )
  const appName = `${AWS.PROFILE.PREFIX}-${gitHubApi.issue.number}`
  const awsProfile = new AwsProfile(appName)
  const dockerContainer = new DockerContainer(appName)

  const environmentParameters = {
    parameterStore,
    gitHubApi,
    git,
    database,
    worktreeConfig,
  }
  await setupWorktreeEnvironment(environmentParameters)

  log('⚙️  Step 4/5: インフラストラクチャをセットアップ中...')
  await setupInfrastructure(
    awsProfile,
    dockerContainer,
    database.name,
    parameterStore.getParameter(PARAMETER_KEYS.DATABASE_ADMIN_PASSWORD)
  )

  log('📝 Step 5/5: プロンプトファイルを生成中...')
  generatePromptFile(gitHubApi, worktreeConfig, awsProfile.name)

  exec(`code "${worktreeConfig.worktreePath}"`)

  log('✅ start-issue処理が完了しました')
}

main().catch((error) => {
  logError(error)
  process.exit(1)
})
