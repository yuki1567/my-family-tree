import { translateText } from '../../../lib/translation.js'
import { log } from '../../../shared/utils.js'

import type { FetchIssueOutput } from './fetch-issue.js'

export type GenerateSlugTitleOutput = FetchIssueOutput & {
  gitHub: FetchIssueOutput['gitHub'] & {
    issueSlugTitle: string
  }
}

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

function convertToSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
