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

  public mergeToMain(): void {
    try {
      execSync('git checkout main', { stdio: 'inherit' })
      execSync('git pull origin main', { stdio: 'inherit' })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      throw new GitOperationError(
        `main への取り込みに失敗しました: ${errorMessage}`
      )
    }
  }

  public static getWorktreeByIssueNumber(issueNumber: number): {
    path: string
    branchName: string
  } {
    const result = execSync('git worktree list', { encoding: 'utf-8' })
    const lines = result.split('\n')

    const worktreeInfo = lines.find((line) => line.includes(`/${issueNumber}-`))

    if (!worktreeInfo) {
      throw new GitOperationError(
        `Issue #${issueNumber} に対応するワークツリーが見つかりません`
      )
    }

    const parts = worktreeInfo.trim().split(/\s+/)
    const path = parts[0]
    const branchWithBrackets = parts[2]

    if (!path || !branchWithBrackets) {
      throw new GitOperationError(
        `Worktree情報のパースに失敗しました: ${worktreeInfo}`
      )
    }

    const branchName = branchWithBrackets.replace(/^\[|\]$/g, '')

    return { path, branchName }
  }
}
