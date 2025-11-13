import { copyFileSync } from 'node:fs'
import path from 'node:path'

import { ParameterStore } from '../../lib/ParameterStore.js'
import { FILES } from '../../shared/constants.js'
import type { WorkflowContext } from '../../shared/types.js'
import { PROJECT_ROOT, log } from '../../shared/utils.js'

export async function setupEnvironment(ctx: WorkflowContext): Promise<void> {
  const srcClaudeLocalSettings = path.join(
    PROJECT_ROOT,
    FILES.CLAUDE_LOCAL_SETTINGS
  )
  const dstClaudeLocalSettings = path.join(
    ctx.worktreeEnvironment.worktreePath,
    FILES.CLAUDE_LOCAL_SETTINGS
  )

  copyFileSync(srcClaudeLocalSettings, dstClaudeLocalSettings)
  log(`Claudeローカル設定ファイルをコピーしました: ${dstClaudeLocalSettings}`)

  await ParameterStore.putParameters(
    ctx.worktreeEnvironment.issueNumber,
    ctx.worktreeEnvironment.getWorktreeParameters()
  )
}
