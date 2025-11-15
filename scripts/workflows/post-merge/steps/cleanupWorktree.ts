import { Git } from 'scripts/workflows/lib/Git.js'

export function cleanupWorktree(git: Git): void {
  git.removeWorktree()
  git.removeLocalBranch()
  git.removeRemoteBranch()
}
