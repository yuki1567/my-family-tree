import { TRANSLATION } from '../core/constants.js'
import type { Ctx } from '../core/types.js'
import { log } from '../core/utils.js'
import { assertCloudTranslation, assertIssueTitle } from '../core/validators.js'

export async function generateSlugTitle(ctx: Ctx): Promise<Ctx> {
  assertIssueTitle(ctx)
  assertCloudTranslation(ctx)

  const endPoint = `${TRANSLATION.API_ENDPOINT}?key=${ctx.cloudTranslation}`

  const response = await fetch(endPoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: ctx.gitHub.issueTitle,
      source: TRANSLATION.SOURCE_LANG,
      target: TRANSLATION.TARGET_LANG,
    }),
  })

  if (!response.ok) {
    throw new Error(`API: ${response.status} ${response.statusText}`)
  }

  const payload = await response.json()

  if (payload.errors) {
    throw new Error(`API: ${JSON.stringify(payload.errors)}`)
  }

  if (!payload.data) {
    throw new Error('APIからデータが取得できませんでした。')
  }
  const translated = payload.data.translations[0].translatedText

  const issueSlugTitle = translated
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  log(`Issueタイトルを翻訳・スラグ化しました: ${issueSlugTitle}`)

  return {
    ...ctx,
    gitHub: {
      ...ctx.gitHub,
      issueSlugTitle,
    },
  }
}
