import { createWorktree as gitCreateWorktree } from '../../lib/git.js'
import type { WorkflowContext } from '../../shared/types.js'

export async function createWorktree(ctx: WorkflowContext): Promise<void> {
  const branchName = ctx.githubApi.branchName
  const worktreePath = ctx.githubApi.worktreePath

  gitCreateWorktree(branchName, worktreePath)
}
