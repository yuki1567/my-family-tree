import type { Git } from 'scripts/workflows/lib/Git.js'

export async function cleanupWorktree(git: Git): Promise<void> {
  git.removeWorktree()
  git.removeLocalBranch()
  git.removeRemoteBranch()
}
