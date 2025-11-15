import { execSync } from 'node:child_process'

import { GitOperationError } from '../shared/errors.js'
import type { WorktreeInfo } from '../shared/types.js'
import { log } from '../shared/utils.js'

export class Git {
  constructor(
    private readonly branchName: string,
    private readonly path: string
  ) {}

  createWorktree(): void {
    try {
      execSync(`git worktree add "${this.path}" -b ${this.branchName}`, {
        stdio: 'inherit',
      })
      log(`✅ Worktree作成完了: ${this.path}`)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      throw new GitOperationError(`Worktree作成に失敗しました: ${errorMessage}`)
    }
  }

  removeWorktree(): void {
    log(`📂 Worktree削除: ${this.path}`)

    try {
      execSync(`git worktree remove "${this.path}"`, {
        stdio: 'inherit',
      })
      log(`✅ Worktree削除完了: ${this.path}`)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      throw new GitOperationError(
        `Worktree削除に失敗しました: ${this.path}\n${errorMessage}`
      )
    }
  }

  removeLocalBranch(): void {
    try {
      const result = execSync(
        `git show-ref --verify --quiet refs/heads/${this.branchName}`,
        { encoding: 'utf-8' }
      )
      if (result !== null) {
        log(`🗑 ローカルブランチ削除: ${this.branchName}`)
        execSync(`git branch -d ${this.branchName}`, { stdio: 'inherit' })
      }
    } catch {
      log(`ℹ️ ローカルブランチは存在しません: ${this.branchName}`)
    }
  }

  removeRemoteBranch(): void {
    try {
      execSync(`git ls-remote --exit-code --heads origin ${this.branchName}`, {
        stdio: 'pipe',
      })
      log(`🗑 リモートブランチ削除: ${this.branchName}`)
      execSync(`git push origin --delete ${this.branchName}`, {
        stdio: 'inherit',
      })
    } catch {
      log(`ℹ️ リモートブランチは既に存在しません: ${this.branchName}`)
    }
  }
}

export function getWorktreeInfo(issueNumber: number): WorktreeInfo {
  try {
    const worktreeList = execSync('git worktree list', { encoding: 'utf-8' })
    const pattern = `/${issueNumber}-`
    const worktreeLine = worktreeList
      .split('\n')
      .find((line) => line.includes(pattern))

    if (!worktreeLine) {
      throw new GitOperationError(
        `ISSUE_NUMBER=${issueNumber} に対応するワークツリーが見つかりません`
      )
    }

    const parts = worktreeLine.split(/\s+/)
    const path = parts[0] || ''
    const branch = parts[2]?.replace(/^\[|\]$/g, '') || ''

    return {
      issueNumber,
      path,
      branch,
    }
  } catch (error) {
    if (error instanceof GitOperationError) {
      throw error
    }
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new GitOperationError(
      `Worktree情報の取得に失敗しました: ${errorMessage}`
    )
  }
}

export function mergeToMain(): void {
  log('🔄 main に取り込み処理開始')

  try {
    execSync('git checkout main', { stdio: 'inherit' })
    execSync('git pull origin main', { stdio: 'inherit' })
    log('✅ main への取り込み完了')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new GitOperationError(
      `main への取り込みに失敗しました: ${errorMessage}`
    )
  }
}
