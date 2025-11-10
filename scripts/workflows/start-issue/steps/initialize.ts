import { ParameterStore } from 'scripts/workflows/lib/parameter-store.js'

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
  const getParameterToNumber = (key: string) => Number(getParameter(key))

  return {
    githubProjects: {
      projectId: getParameter(PARAMETER_KEYS.GITHUB.PROJECT_ID),
      projectNumber: getParameterToNumber(PARAMETER_KEYS.GITHUB.PROJECT_NUMBER),
      statusFieldId: getParameter(PARAMETER_KEYS.GITHUB.STATUS_FIELD_ID),
      todoStatusId: getParameter(PARAMETER_KEYS.GITHUB.TODO_STATUS_ID),
      inProgressStatusId: getParameter(
        PARAMETER_KEYS.GITHUB.INPROGRESS_STATUS_ID
      ),
      inReviewStatusId: getParameter(PARAMETER_KEYS.GITHUB.INREVIEW_STATUS_ID),
    },
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
