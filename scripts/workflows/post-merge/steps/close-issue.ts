import { removeLocalBranch, removeRemoteBranch } from '../../lib/git.js'
import type { WorkflowContext } from '../../shared/types.js'

export function githubCloseIssue(ctx: WorkflowContext): void {
  removeLocalBranch(ctx.worktreeEnvironment.branchName)
  removeRemoteBranch(ctx.worktreeEnvironment.branchName)
  ctx.githubApi.closeIssue()
}
