import { Git } from '../../lib/Git.js'
import type { WorkflowContext } from '../../shared/types.js'

export function createGitWorktree(ctx: WorkflowContext): void {
  const git = new Git(
    ctx.worktreeEnvironment.branchName,
    ctx.worktreeEnvironment.worktreePath
  )
  git.createWorktree()
}
