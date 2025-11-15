import path from 'node:path'
import { URL } from 'node:url'
import { WorktreeScriptError } from 'scripts/workflows/shared/errors.js'
import { GoogleTranslateResponse } from 'scripts/workflows/shared/types.js'

import { AwsProfile } from '../lib/AwsProfile.js'
import { Database } from '../lib/Database.js'
import { DockerContainer } from '../lib/DockerContainer.js'
import { Git } from '../lib/Git.js'
import { GitHubApi } from '../lib/GitHubApi.js'
import { ParameterStore } from '../lib/ParameterStore.js'
import {
  AWS,
  PARAMETER_KEYS,
  REQUIRED_WORKTREE_PARAMETERS,
  TRANSLATION,
} from '../shared/constants.js'
import { PROJECT_ROOT, logError, parseIssueNumber } from '../shared/utils.js'

async function main() {
  const issueNumber = parseIssueNumber(process.argv[2])

  const parameterStore = await ParameterStore.create(
    `${AWS.PARAMETER_PATH.WORKTREE}/${issueNumber}`,
    REQUIRED_WORKTREE_PARAMETERS
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

  const translatedText = await translateText(
    gitHubApi.issue.title,
    parameterStore.getParameter(PARAMETER_KEYS.GOOGLE_TRANSLATE_API_KEY)
  )
  const slugTitle = convertToSlug(translatedText)

  const branchName = `${gitHubApi.issue.label}/${gitHubApi.issue.number}-${slugTitle}`
  const worktreePath = path.resolve(
    PROJECT_ROOT,
    '..',
    gitHubApi.issue.label,
    `${issueNumber}-${slugTitle}`
  )

  const git = new Git(branchName, worktreePath)

  git.mergeToMain()

  const database = new Database(
    slugTitle,
    parameterStore.getParameter(PARAMETER_KEYS.DATABASE_ADMIN_USER),
    parameterStore.getParameter(PARAMETER_KEYS.DATABASE_ADMIN_PASSWORD),
    parameterStore.getParameter(PARAMETER_KEYS.DATABASE_USER),
    parameterStore.getParameter(PARAMETER_KEYS.DATABASE_USER_PASSWORD)
  )

  const dockerContainer = new DockerContainer(`app-${slugTitle}`)

  dockerContainer.deleteDatabase(
    database.name,
    parameterStore.getParameter(PARAMETER_KEYS.DATABASE_ADMIN_PASSWORD)
  )

  parameterStore.deleteParameters()

  const awsProfile = new AwsProfile(gitHubApi.issue.number)

  awsProfile.delete()

  dockerContainer.cleanup()

  git.removeWorktree()

  git.removeLocalBranch()

  git.removeRemoteBranch()

  gitHubApi.closeIssue()
}

async function translateText(text: string, apiKey: string): Promise<string> {
  const url = new URL(TRANSLATION.API_ENDPOINT)
  url.searchParams.set('q', text)
  url.searchParams.set('source', TRANSLATION.SOURCE_LANG)
  url.searchParams.set('target', TRANSLATION.TARGET_LANG)
  url.searchParams.set('key', apiKey)

  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
    })

    if (!response.ok) {
      throw new WorktreeScriptError(
        `Translation API error: ${response.status} ${response.statusText}`
      )
    }

    const data: unknown = await response.json()

    if (!isGoogleTranslateResponse(data)) {
      throw new WorktreeScriptError('翻訳APIのレスポンス形式が不正です')
    }

    const firstTranslation = data.data.translations[0]

    if (!firstTranslation) {
      throw new WorktreeScriptError('翻訳結果が空です')
    }

    return firstTranslation.translatedText
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new WorktreeScriptError(`翻訳に失敗しました: ${errorMessage}`)
  }
}

function isGoogleTranslateResponse(
  data: unknown
): data is GoogleTranslateResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'data' in data &&
    typeof data.data === 'object' &&
    data.data !== null &&
    'translations' in data.data &&
    Array.isArray(data.data.translations)
  )
}

function convertToSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

main().catch((error) => {
  logError(error)
  process.exit(1)
})
