import { GitHubApi } from 'scripts/workflows/lib/GitHubApi.js'
import { ParameterStore } from 'scripts/workflows/lib/ParameterStore.js'
import {
  AWS,
  PARAMETER_KEYS,
  REQUIRED_DEVELOPMENT_PARAMETERS,
} from 'scripts/workflows/shared/constants.js'

export async function initialize(): Promise<{
  parameterStore: ParameterStore
  gitHubApi: GitHubApi
}> {
  const parameterStore = await ParameterStore.create(
    AWS.PARAMETER_PATH.DEVELOPMENT,
    REQUIRED_DEVELOPMENT_PARAMETERS
  )

  const issueStatusIds = {
    todo: parameterStore.getParameter(PARAMETER_KEYS.GITHUB_TODO_STATUS_ID),
    inProgress: parameterStore.getParameter(
      PARAMETER_KEYS.GITHUB_INPROGRESS_STATUS_ID
    ),
    inReview: parameterStore.getParameter(
      PARAMETER_KEYS.GITHUB_INREVIEW_STATUS_ID
    ),
  }

  const gitHubApi = await GitHubApi.create(
    parameterStore.getParameter(PARAMETER_KEYS.GITHUB_PROJECT_ID),
    parameterStore.getParameter(PARAMETER_KEYS.GITHUB_STATUS_FIELD_ID),
    issueStatusIds
  )

  return {
    parameterStore,
    gitHubApi,
  }
}
