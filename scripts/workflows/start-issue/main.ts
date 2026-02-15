import { exec } from 'node:child_process'

import { AwsProfile } from '../lib/AwsProfile.js'
import { Database } from '../lib/Database.js'
import { DockerContainer } from '../lib/DockerContainer.js'
import { Git } from '../lib/Git.js'
import { PARAMETER_KEYS } from '../shared/constants.js'
import { buildWorktreeConfig } from '../shared/steps/buildWorktreeConfig.js'
import { log, logError } from '../shared/utils.js'

import { generateDockerComposeOverride } from './steps/generateDockerComposeOverride.js'
import { generatePromptFile } from './steps/generatePromptFile.js'
import { initialize } from './steps/initialize.js'
import { setupInfrastructure } from './steps/setupInfrastructure.js'
import { setupWorktreeEnvironment } from './steps/setupWorktreeEnvironment.js'

async function main() {
  log('🚀 start-issueワークフローを開始します')

  log('📋 Step 1/6: GitHub Issue情報を取得中...')
  const { parameterStore, gitHubApi } = await initialize()

  log('🔄 Step 2/6: Issue操作を実行中...')
  gitHubApi.assignToCurrentUser()
  gitHubApi.moveToInProgress()

  log('🏗️  Step 3/6: Worktree環境を構築中...')
  const worktreeConfig = buildWorktreeConfig(gitHubApi.issue.number)

  const git = new Git(worktreeConfig.branchName, worktreeConfig.worktreePath)
  const database = new Database(
    worktreeConfig.databaseName,
    parameterStore.getParameter(PARAMETER_KEYS.DATABASE_ADMIN_USER),
    parameterStore.getParameter(PARAMETER_KEYS.DATABASE_ADMIN_PASSWORD),
    parameterStore.getParameter(PARAMETER_KEYS.DATABASE_USER),
    parameterStore.getParameter(PARAMETER_KEYS.DATABASE_USER_PASSWORD)
  )
  const awsProfile = new AwsProfile(worktreeConfig.branchName)
  const dockerContainer = new DockerContainer(worktreeConfig.branchName)

  const environmentParameters = {
    parameterStore,
    gitHubApi,
    git,
    database,
    worktreeConfig,
  }
  await setupWorktreeEnvironment(environmentParameters)

  log('🐳 Step 4/6: Docker Compose設定を生成中...')
  generateDockerComposeOverride(worktreeConfig)

  log('⚙️  Step 5/6: インフラストラクチャをセットアップ中...')
  await setupInfrastructure(
    awsProfile,
    dockerContainer,
    database.name,
    parameterStore.getParameter(PARAMETER_KEYS.DATABASE_ADMIN_PASSWORD)
  )

  log('📝 Step 6/6: プロンプトファイルを生成中...')
  generatePromptFile(gitHubApi, worktreeConfig, awsProfile.name)

  awsProfile.generateEnvrc(worktreeConfig.worktreePath, gitHubApi.issue.number)

  exec(`code "${worktreeConfig.worktreePath}"`)

  log('✅ start-issue処理が完了しました')
}

main().catch((error) => {
  logError(error)
  process.exit(1)
})
