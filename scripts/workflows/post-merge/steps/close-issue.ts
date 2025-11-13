import { removeLocalBranch, removeRemoteBranch } from '../../lib/git.js'
import { closeIssue as githubCloseIssue } from '../../lib/GitHubApi.js'
import type { WorktreeInfo } from '../../shared/types.js'

export function closeIssue(worktreeInfo: WorktreeInfo): void {
  removeLocalBranch(worktreeInfo.branch)
  removeRemoteBranch(worktreeInfo.branch)
  githubCloseIssue(worktreeInfo.issueNumber)
}
