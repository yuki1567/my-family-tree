import { translateText } from '../../lib/translation.js'
import type {
  FetchIssueContext,
  GenerateSlugTitleContext,
} from '../../shared/types.js'
import { log } from '../../shared/utils.js'

export async function generateSlugTitle(
  ctx: FetchIssueContext
): Promise<GenerateSlugTitleContext> {
  const translatedText = await translateText(
    ctx.gitHub.issueTitle,
    ctx.cloudTranslationApiKey
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

function convertToSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
