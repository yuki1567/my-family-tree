import { extractIssueLabel, fetchIssueByNumber } from '../../lib/github-api.js'
import { log } from '../../shared/utils.js'

import type { InitializeOutput } from './initialize.js'

export type FetchIssueOutput = InitializeOutput & {
  gitHub: {
    issueNumber: number
    issueTitle: string
    issueLabel: string
  }
  githubProjects: InitializeOutput['githubProjects'] & {
    projectItemId: string
  }
}

export async function fetchIssue(
  ctx: InitializeOutput,
  issueNumber: number
): Promise<FetchIssueOutput> {
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
