import { copyFileSync } from 'node:fs'
import path from 'node:path'
import { ParameterStore } from 'scripts/workflows/lib/ParameterStore.js'

import { WorktreeEnvironment } from '../../lib/WorktreeEnvironment.js'
import { FILES, PARAMETER_KEYS } from '../../shared/constants.js'
import type { WorkflowContext } from '../../shared/types.js'
import { PROJECT_ROOT, log } from '../../shared/utils.js'

export async function setupEnvironment(ctx: WorkflowContext): Promise<void> {
  const issueNumber = ctx.githubApi.issueData.number
  const slugTitle = ctx.githubApi.slugTitle
  const dbConfig = {
    adminUser: ctx.parameterStore.get(PARAMETER_KEYS.DATABASE_ADMIN_USER),
    adminPassword: ctx.parameterStore.get(
      PARAMETER_KEYS.DATABASE_ADMIN_PASSWORD
    ),
    user: ctx.parameterStore.get(PARAMETER_KEYS.DATABASE_USER),
    userPassword: ctx.parameterStore.get(PARAMETER_KEYS.DATABASE_USER_PASSWORD),
  }
  const logLevel = ctx.parameterStore.get(PARAMETER_KEYS.LOG_LEVEL)
  const worktreeEnvironment = new WorktreeEnvironment(
    issueNumber,
    slugTitle,
    dbConfig,
    logLevel
  )

  const srcClaudeLocalSettings = path.join(
    PROJECT_ROOT,
    FILES.CLAUDE_LOCAL_SETTINGS
  )
  const dstClaudeLocalSettings = path.join(
    ctx.githubApi.worktreePath,
    FILES.CLAUDE_LOCAL_SETTINGS
  )

  copyFileSync(srcClaudeLocalSettings, dstClaudeLocalSettings)
  log(`Claudeローカル設定ファイルをコピーしました: ${dstClaudeLocalSettings}`)

  await ParameterStore.putParameters(
    issueNumber,
    worktreeEnvironment.getWorktreeParameters()
  )
}
