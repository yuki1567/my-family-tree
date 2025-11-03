import { TRANSLATION } from '../core/constants.js'
import { GoogleTranslateError } from '../core/errors.js'
import type {
  FetchIssueOutput,
  GenerateSlugTitleOutput,
  GoogleTranslateResponse,
} from '../core/types.js'
import { log } from '../core/utils.js'

export async function generateSlugTitle(
  ctx: FetchIssueOutput
): Promise<GenerateSlugTitleOutput> {
  const translatedText = await translateText(
    ctx.gitHub.issueTitle,
    ctx.cloudTranslation
  )
  const issueSlugTitle = convertToSlug(translatedText)

  log(`Issueタイトルを翻訳・スラグ化しました: ${issueSlugTitle}`)

  return {
    ...ctx,
    gitHub: {
      ...ctx.gitHub,
      issueSlugTitle,
    },
  }
}

async function translateText(text: string, apiKey: string): Promise<string> {
  const endPoint = `${TRANSLATION.API_ENDPOINT}?key=${apiKey}`

  const response = await fetch(endPoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: text,
      source: TRANSLATION.SOURCE_LANG,
      target: TRANSLATION.TARGET_LANG,
    }),
  })

  if (!response.ok) {
    throw new GoogleTranslateError(response.status, response.statusText)
  }

  const payload = await response.json()
  const validatedData = validateTranslationResponse(payload, response)

  const firstTranslation = validatedData.data.translations[0]

  if (!firstTranslation) {
    throw new GoogleTranslateError(response.status, 'No translation found')
  }

  return firstTranslation.translatedText
}

function validateTranslationResponse(
  data: unknown,
  response: Response
): GoogleTranslateResponse {
  if (
    typeof data === 'object' &&
    data !== null &&
    'data' in data &&
    typeof data.data === 'object' &&
    data.data !== null &&
    'translations' in data.data &&
    Array.isArray(data.data.translations) &&
    data.data.translations.length > 0 &&
    typeof data.data.translations[0] === 'object' &&
    data.data.translations[0] !== null &&
    'translatedText' in data.data.translations[0] &&
    typeof data.data.translations[0].translatedText === 'string'
  ) {
    return data as GoogleTranslateResponse
  }

  throw new GoogleTranslateError(response.status, response.statusText)
}

function convertToSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
