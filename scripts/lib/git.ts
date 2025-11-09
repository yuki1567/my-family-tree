import { execSync } from 'node:child_process'

import { GitOperationError } from '../shared/errors.js'
import type { WorktreeInfo } from '../shared/types.js'
import { log } from '../shared/utils.js'

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

export function removeWorktree(worktreePath: string): void {
  log(`📂 Worktree削除: ${worktreePath}`)

  try {
    execSync(`git worktree remove "${worktreePath}"`, { stdio: 'inherit' })
    log(`✅ Worktree削除完了: ${worktreePath}`)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new GitOperationError(
      `Worktree削除に失敗しました: ${worktreePath}\n${errorMessage}`
    )
  }
}

export function removeLocalBranch(branchName: string): void {
  try {
    const result = execSync(
      `git show-ref --verify --quiet refs/heads/${branchName}`,
      { encoding: 'utf-8' }
    )
    if (result !== null) {
      log(`🗑 ローカルブランチ削除: ${branchName}`)
      execSync(`git branch -d ${branchName}`, { stdio: 'inherit' })
    }
  } catch {
    log(`ℹ️ ローカルブランチは存在しません: ${branchName}`)
  }
}

export function removeRemoteBranch(branchName: string): void {
  try {
    execSync(`git ls-remote --exit-code --heads origin ${branchName}`, {
      stdio: 'pipe',
    })
    log(`🗑 リモートブランチ削除: ${branchName}`)
    execSync(`git push origin --delete ${branchName}`, { stdio: 'inherit' })
  } catch {
    log(`ℹ️ リモートブランチは既に存在しません: ${branchName}`)
  }
}

export function createWorktree(branchName: string, worktreePath: string): void {
  try {
    execSync(`git worktree add "${worktreePath}" -b ${branchName}`, {
      stdio: 'inherit',
    })
    log(`✅ Worktree作成完了: ${worktreePath}`)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new GitOperationError(`Worktree作成に失敗しました: ${errorMessage}`)
  }
}
