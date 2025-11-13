import type { WorkflowContext } from '../../shared/types.js'
import { log } from '../../shared/utils.js'

export async function fetchIssue(ctx: WorkflowContext): Promise<void> {
  await ctx.githubApi.loadTopPriorityIssue()

  const issueData = ctx.githubApi.issueData

  ctx.worktreeEnvironment.setIssueData({
    number: issueData.number,
    title: issueData.title,
    label: issueData.label,
    projectItemId: issueData.projectItemId,
  })

  log(`✓ Issue #${issueData.number}: ${issueData.title}`)
  log(`✓ Label: ${issueData.label}`)
}
