import { GitHubApi } from '../../lib/github-api.js'
import { ParameterStore } from '../../lib/parameter-store.js'
import { AWS, PARAMETER_KEYS } from '../../shared/constants.js'
import type { InitializeContext } from '../../shared/types.js'
import { log } from '../../shared/utils.js'

export async function initialize(): Promise<InitializeContext> {
  const parameterStore = new ParameterStore()
  const parameters = await parameterStore.getParameterMap(
    AWS.PARAMETER_PATH.DEVELOPMENT
  )

  log('Parameter Storeからパラメータを読み込み、コンテキストを初期化しました')

  const getParameter = (key: string) =>
    parameterStore.getRequired(parameters, key, AWS.PARAMETER_PATH.DEVELOPMENT)

  const githubApi = new GitHubApi(
    getParameter(PARAMETER_KEYS.GITHUB.PROJECT_ID),
    getParameter(PARAMETER_KEYS.GITHUB.STATUS_FIELD_ID),
    {
      todo: getParameter(PARAMETER_KEYS.GITHUB.TODO_STATUS_ID),
      inProgress: getParameter(PARAMETER_KEYS.GITHUB.INPROGRESS_STATUS_ID),
      inReview: getParameter(PARAMETER_KEYS.GITHUB.INREVIEW_STATUS_ID),
    }
  )

  return {
    githubApi,
    cloudTranslationApiKey: getParameter(
      PARAMETER_KEYS.GOOGLE.TRANSLATE_API_KEY
    ),
    database: {
      adminUser: getParameter(PARAMETER_KEYS.DATABASE.ADMIN_USER),
      adminPassword: getParameter(PARAMETER_KEYS.DATABASE.ADMIN_PASSWORD),
      user: getParameter(PARAMETER_KEYS.DATABASE.USER),
      userPassword: getParameter(PARAMETER_KEYS.DATABASE.USER_PASSWORD),
    },
  }
}
