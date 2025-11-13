import { URL } from 'node:url'

import { PARAMETER_KEYS, TRANSLATION } from '../../shared/constants.js'
import { WorktreeScriptError } from '../../shared/errors.js'
import type {
  GoogleTranslateResponse,
  WorkflowContext,
} from '../../shared/types.js'
import { log, PROJECT_ROOT } from '../../shared/utils.js'

export async function generateSlugTitle(ctx: WorkflowContext): Promise<void> {
  const issueTitle = ctx.githubApi.issueData.title
  const apiKey = ctx.parameterStore.get(PARAMETER_KEYS.GOOGLE_TRANSLATE_API_KEY)

  const translatedText = await translateText(issueTitle, apiKey)
  const slugTitle = convertToSlug(translatedText)

  ctx.worktreeEnvironment.generatePaths(slugTitle, PROJECT_ROOT)

  log(`Issueタイトルを翻訳・スラグ化しました: ${slugTitle}`)
  log(`✓ Branch: ${ctx.worktreeEnvironment.branchName}`)
  log(`✓ Path: ${ctx.worktreeEnvironment.worktreePath}`)
}

function convertToSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
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
