import { createWorktree } from '../../lib/git.js'
import type { WorkflowContext } from '../../shared/types.js'

export async function createGitWorktree(ctx: WorkflowContext): Promise<void> {
  const branchName = ctx.githubApi.branchName
  const worktreePath = ctx.githubApi.worktreePath

  createWorktree(branchName, worktreePath)
}
