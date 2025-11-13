import type { WorkflowContext } from '../../shared/types.js'

export async function moveIssueToInProgress(
  ctx: WorkflowContext
): Promise<void> {
  ctx.githubApi.assignToCurrentUser()
  await ctx.githubApi.moveToInProgress()
}
