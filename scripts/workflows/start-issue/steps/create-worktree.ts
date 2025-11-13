import { createWorktree } from '../../lib/git.js'
import type { WorkflowContext } from '../../shared/types.js'

export function createGitWorktree(ctx: WorkflowContext): void {
  const branchName = ctx.worktreeEnvironment.branchName
  const worktreePath = ctx.worktreeEnvironment.worktreePath

  createWorktree(branchName, worktreePath)
}
