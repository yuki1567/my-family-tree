import type { WorkflowContext } from '../../shared/types.js'
import { log } from '../../shared/utils.js'

export async function fetchIssue(
  ctx: WorkflowContext
): Promise<WorkflowContext> {
  await ctx.githubApi.loadTopPriorityIssue()

  log(
    `✓ Issue #${ctx.githubApi.issueData.number}: ${ctx.githubApi.issueData.title}`
  )
  log(`✓ Label: ${ctx.githubApi.issueData.label}`)

  return ctx
}
