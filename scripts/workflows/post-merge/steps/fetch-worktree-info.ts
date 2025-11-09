import { getWorktreeInfo } from '../../../lib/git.js'
import type { WorktreeInfo } from '../../../shared/types.js'
import { log } from '../../../shared/utils.js'

export function fetchWorktreeInfo(issueNumber: number): WorktreeInfo {
  const worktreeInfo = getWorktreeInfo(issueNumber)

  log(`🛠 Worktree Path: ${worktreeInfo.path}`)
  log(`🛠 Branch Name: ${worktreeInfo.branch}`)

  return worktreeInfo
}
