import { exec } from 'node:child_process'

import { AwsProfile } from '../lib/AwsProfile.js'
import { Database } from '../lib/Database.js'
import { DockerContainer } from '../lib/DockerContainer.js'
import { Git } from '../lib/Git.js'
import { PARAMETER_KEYS } from '../shared/constants.js'
import { logError } from '../shared/utils.js'

import { buildWorktreeConfig } from './steps/buildWorktreeConfig.js'
import { generatePromptFile } from './steps/generatePromptFile.js'
import { generateSlugFromIssueTitle } from './steps/generateSlugFromIssueTitle.js'
import { initialize } from './steps/initialize.js'
import { setupInfrastructure } from './steps/setupInfrastructure.js'
import { setupWorktreeEnvironment } from './steps/setupWorktreeEnvironment.js'

async function main() {
  const { parameterStore, gitHubApi } = await initialize()

  gitHubApi.assignToCurrentUser()
  gitHubApi.moveToInProgress()

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
  const awsProfile = new AwsProfile(gitHubApi.issue.number)
  const dockerContainer = new DockerContainer(`app-${slugTitle}`)

  const environmentParameters = {
    parameterStore,
    gitHubApi,
    git,
    database,
    worktreeConfig,
  }
  setupWorktreeEnvironment(environmentParameters)

  await setupInfrastructure(
    awsProfile,
    dockerContainer,
    database.name,
    parameterStore.getParameter(PARAMETER_KEYS.DATABASE_ADMIN_PASSWORD)
  )

  generatePromptFile(gitHubApi, worktreeConfig, awsProfile.name)

  exec(`code "${worktreeConfig.worktreePath}"`)
}

main().catch((error) => {
  logError(error)
  process.exit(1)
})
