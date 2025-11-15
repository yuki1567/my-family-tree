import { Git } from '../../lib/Git.js'
import type { WorkflowContext } from '../../shared/types.js'

export function githubCloseIssue(ctx: WorkflowContext): void {
  const git = new Git(ctx.worktreeEnvironment.branchName, '')
  git.removeLocalBranch()
  git.removeRemoteBranch()
  ctx.githubApi.closeIssue()
}
