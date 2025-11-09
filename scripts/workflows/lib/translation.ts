import { URL } from 'node:url'

import { TRANSLATION } from '../shared/constants.js'
import { WorktreeScriptError } from '../shared/errors.js'
import type { GoogleTranslateResponse } from '../shared/types.js'

export async function translateText(
  text: string,
  apiKey: string
): Promise<string> {
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

    const data = (await response.json()) as GoogleTranslateResponse
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
