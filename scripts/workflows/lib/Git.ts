import { execSync } from 'node:child_process'

import { log } from '../shared/utils.js'

import { GitError } from './WorkflowError.js'

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
      throw new GitError(
        `Worktree作成に失敗しました: ${errorMessage}`,
        'Git.createWorktree'
      )
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
      throw new GitError(
        `Worktree削除に失敗しました: ${this.path}\n${errorMessage}`,
        'Git.removeWorktree'
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

  public mergeToMain(): void {
    try {
      execSync('git checkout main', { stdio: 'inherit' })
      execSync('git pull origin main', { stdio: 'inherit' })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      throw new GitError(
        `main への取り込みに失敗しました: ${errorMessage}`,
        'Git.mergeToMain'
      )
    }
  }
}
