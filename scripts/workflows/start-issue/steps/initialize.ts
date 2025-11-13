import { GitHubApi } from '../../lib/GitHubApi.js'
import { ParameterStore } from '../../lib/ParameterStore.js'
import { WorktreeEnvironment } from '../../lib/WorktreeEnvironment.js'
import { AWS, PARAMETER_KEYS } from '../../shared/constants.js'
import type { WorkflowContext } from '../../shared/types.js'
import { log } from '../../shared/utils.js'

export async function initialize(): Promise<WorkflowContext> {
  const parameterStore = await ParameterStore.create(
    AWS.PARAMETER_PATH.DEVELOPMENT
  )

  parameterStore.validateRequiredParameters(Object.values(PARAMETER_KEYS))

  const githubApi = new GitHubApi(
    parameterStore.get(PARAMETER_KEYS.GITHUB_PROJECT_ID),
    parameterStore.get(PARAMETER_KEYS.GITHUB_STATUS_FIELD_ID),
    {
      todo: parameterStore.get(PARAMETER_KEYS.GITHUB_TODO_STATUS_ID),
      inProgress: parameterStore.get(
        PARAMETER_KEYS.GITHUB_INPROGRESS_STATUS_ID
      ),
      inReview: parameterStore.get(PARAMETER_KEYS.GITHUB_INREVIEW_STATUS_ID),
    }
  )

  const dbConfig = {
    adminUser: parameterStore.get(PARAMETER_KEYS.DATABASE_ADMIN_USER),
    adminPassword: parameterStore.get(PARAMETER_KEYS.DATABASE_ADMIN_PASSWORD),
    user: parameterStore.get(PARAMETER_KEYS.DATABASE_USER),
    userPassword: parameterStore.get(PARAMETER_KEYS.DATABASE_USER_PASSWORD),
  }
  const logLevel = parameterStore.get(PARAMETER_KEYS.LOG_LEVEL)
  const worktreeEnvironment = new WorktreeEnvironment(dbConfig, logLevel)

  log('Parameter Storeからパラメータを読み込み、コンテキストを初期化しました')

  return {
    parameterStore,
    githubApi,
    worktreeEnvironment,
  }
}
