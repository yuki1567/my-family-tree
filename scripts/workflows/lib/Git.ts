import { execSync } from 'node:child_process'

import { GitOperationError } from '../shared/errors.js'
import { log } from '../shared/utils.js'

export class Git {
  constructor(
    private readonly branchName: string,
    private readonly path: string
  ) {}

  public createWorktree(): void {
    try {
      execSync(`git worktree add "${this.path}" -b ${this.branchName}`, {
        stdio: 'inherit',
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      throw new GitOperationError(`Worktree作成に失敗しました: ${errorMessage}`)
    }
  }

  public removeWorktree(): void {
    try {
      execSync(`git worktree remove "${this.path}"`, {
        stdio: 'inherit',
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      throw new GitOperationError(
        `Worktree削除に失敗しました: ${this.path}\n${errorMessage}`
      )
    }
  }

  public removeLocalBranch(): void {
    try {
      const result = execSync(
        `git show-ref --verify --quiet refs/heads/${this.branchName}`,
        { encoding: 'utf-8' }
      )
      if (result !== null) {
        execSync(`git branch -d ${this.branchName}`, { stdio: 'inherit' })
      }
    } catch {
      log(`ℹ️ ローカルブランチは存在しません: ${this.branchName}`)
    }
  }

  public removeRemoteBranch(): void {
    try {
      execSync(`git ls-remote --exit-code --heads origin ${this.branchName}`, {
        stdio: 'pipe',
      })
      execSync(`git push origin --delete ${this.branchName}`, {
        stdio: 'inherit',
      })
    } catch {
      log(`ℹ️ リモートブランチは既に存在しません: ${this.branchName}`)
    }
  }
}
