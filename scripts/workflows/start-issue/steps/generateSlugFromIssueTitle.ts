import { URL } from 'node:url'
import { TRANSLATION } from 'scripts/workflows/shared/constants.js'
import { WorktreeScriptError } from 'scripts/workflows/shared/errors.js'
import { GoogleTranslateResponse } from 'scripts/workflows/shared/types.js'

export async function generateSlugFromIssueTitle(
  issueTitle: string,
  apiKey: string
): Promise<string> {
  const translatedText = await translateText(issueTitle, apiKey)
  return convertToSlug(translatedText)
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
