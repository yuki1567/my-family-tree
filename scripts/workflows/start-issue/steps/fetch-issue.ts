import { extractIssueLabel, fetchIssueByNumber } from '../../lib/github-api.js'
import type {
  FetchIssueContext,
  InitializeContext,
} from '../../shared/types.js'
import { log } from '../../shared/utils.js'

export async function fetchIssue(
  ctx: InitializeContext,
  issueNumber: number
): Promise<FetchIssueContext> {
  const { issue, projectItemId } = await fetchIssueByNumber(
    ctx.githubProjects.projectId,
    issueNumber
  )

  const issueLabel = extractIssueLabel(issue)

  log(`✓ Issue #${issue.number}: ${issue.title}`)
  log(`✓ Label: ${issueLabel}`)

  return {
    ...ctx,
    gitHub: {
      issueNumber: issue.number,
      issueTitle: issue.title,
      issueLabel,
    },
    githubProjects: {
      ...ctx.githubProjects,
      projectItemId,
    },
  }
}
