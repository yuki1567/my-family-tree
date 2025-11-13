import { exec } from 'node:child_process'

import type { WorkflowContext } from '../../shared/types.js'
import { log } from '../../shared/utils.js'

export async function openVscode(ctx: WorkflowContext): Promise<void> {
  log('VSCodeを起動中...')
  exec(`code "${ctx.worktreeEnvironment.worktreePath}"`)
  log(`✅ Issue #${ctx.githubApi.issueData.number} の開発環境セットアップ完了`)
}
