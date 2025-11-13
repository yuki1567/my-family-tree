import { createWorktree } from '../../lib/git.js'
import type { WorkflowContext } from '../../shared/types.js'

export async function createGitWorktree(ctx: WorkflowContext): Promise<void> {
  const branchName = ctx.worktreeEnvironment.branchName
  const worktreePath = ctx.worktreeEnvironment.worktreePath

  createWorktree(branchName, worktreePath)
}
