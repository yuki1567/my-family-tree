import type { WorkflowContext } from '../../shared/types.js'
import { log } from '../../shared/utils.js'

export async function fetchIssue(ctx: WorkflowContext): Promise<void> {
  await ctx.githubApi.loadTopPriorityIssue()

  const issueData = ctx.githubApi.issueData

  ctx.worktreeEnvironment.setIssueData({
    number: issueData.number,
    label: issueData.label,
  })

  log(`✓ Issue #${issueData.number}: ${issueData.title}`)
  log(`✓ Label: ${issueData.label}`)
}
