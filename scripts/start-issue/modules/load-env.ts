import type { LoadEnvOutput } from '../core/types.js'
import { log } from '../core/utils.js'

import {
  getRequiredParameter,
  loadParametersFromStore,
} from './parameter-store.js'

export async function loadEnv(): Promise<LoadEnvOutput> {
  const params = await loadParametersFromStore()

  const dbAdminUser = getRequiredParameter(params, 'DATABASE_ADMIN_USER')
  const dbAdminPassword = getRequiredParameter(
    params,
    'DATABASE_ADMIN_PASSWORD'
  )
  const dbUser = getRequiredParameter(params, 'DATABASE_USER')
  const dbUserPassword = getRequiredParameter(params, 'DATABASE_USER_PASSWORD')
  const googleTranslateApiKey = getRequiredParameter(
    params,
    'GOOGLE_TRANSLATE_API_KEY'
  )
  const githubProjectId = getRequiredParameter(params, 'GITHUB_PROJECT_ID')
  const githubProjectNumber = getRequiredParameter(
    params,
    'GITHUB_PROJECT_NUMBER'
  )
  const githubStatusFieldId = getRequiredParameter(
    params,
    'GITHUB_STATUS_FIELD_ID'
  )
  const todoStatusId = getRequiredParameter(params, 'GITHUB_TODO_STATUS_ID')
  const inProgressStatusId = getRequiredParameter(
    params,
    'GITHUB_INPROGRESS_STATUS_ID'
  )
  const inReviewStatusId = getRequiredParameter(
    params,
    'GITHUB_INREVIEW_STATUS_ID'
  )

  log('環境変数を読み込みました')
  return {
    githubProjects: {
      projectId: githubProjectId,
      projectNumber: Number(githubProjectNumber),
      statusFieldId: githubStatusFieldId,
      todoStatusId,
      inProgressStatusId,
      inReviewStatusId,
    },
    cloudTranslation: googleTranslateApiKey,
    environment: {
      dbAdminUser,
      dbAdminPassword,
      dbUser,
      dbUserPassword,
    },
  }
}
