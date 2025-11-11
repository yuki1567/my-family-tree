import type { InitializeContext } from '../../shared/types.js'
import { log } from '../../shared/utils.js'

export async function fetchIssue(
  ctx: InitializeContext
): Promise<InitializeContext> {
  await ctx.githubApi.loadTopPriorityIssue()

  log(
    `✓ Issue #${ctx.githubApi.getIssueNumber()}: ${ctx.githubApi.getIssueTitle()}`
  )
  log(`✓ Label: ${ctx.githubApi.getIssueLabel()}`)

  return ctx
}
