import { removeWorktree as gitRemoveWorktree } from '../../../lib/git.js'
import type { WorktreeInfo } from '../../../shared/types.js'

export function removeWorktree(worktreeInfo: WorktreeInfo): void {
  gitRemoveWorktree(worktreeInfo.path)
}
