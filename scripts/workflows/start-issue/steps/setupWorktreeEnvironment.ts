import { copyFileSync } from 'fs'
import path from 'path'

import { ParameterStore } from 'scripts/workflows/lib/ParameterStore.js'
import {
  FILES,
  PARAMETER_KEYS,
  WORKTREE_PARAMETERS,
} from 'scripts/workflows/shared/constants.js'
import { WorktreeEnvironmentParameters } from 'scripts/workflows/shared/types.js'
import { PROJECT_ROOT } from 'scripts/workflows/shared/utils.js'

export async function setupWorktreeEnvironment(
  parameters: WorktreeEnvironmentParameters
): Promise<void> {
  const { parameterStore, gitHubApi, git, database, worktreeConfig } =
    parameters
  git.createWorktree()

  const srcClaudeLocalSettings = path.join(
    PROJECT_ROOT,
    FILES.CLAUDE_LOCAL_SETTINGS
  )
  const dstClaudeLocalSettings = path.join(
    worktreeConfig.worktreePath,
    FILES.CLAUDE_LOCAL_SETTINGS
  )
  copyFileSync(srcClaudeLocalSettings, dstClaudeLocalSettings)

  const KEYS = WORKTREE_PARAMETERS.KEYS
  const worktreeParameters = {
    [KEYS.ISSUE_NUMBER]: gitHubApi.issue.number,
    [KEYS.BRANCH_NAME]: worktreeConfig.branchName,
    [KEYS.WEB_PORT]: worktreeConfig.webPort,
    [KEYS.API_PORT]: worktreeConfig.apiPort,
    [KEYS.DATABASE_NAME]: database.name,
    [KEYS.DATABASE_URL]: database.userUrl,
    [KEYS.DATABASE_ADMIN_URL]: database.adminUrl,
    [KEYS.DATABASE_ADMIN_USER]: parameterStore.getParameter(
      PARAMETER_KEYS.DATABASE_ADMIN_USER
    ),
    [KEYS.DATABASE_ADMIN_PASSWORD]: parameterStore.getParameter(
      PARAMETER_KEYS.DATABASE_ADMIN_PASSWORD
    ),
    [KEYS.DATABASE_USER]: parameterStore.getParameter(
      PARAMETER_KEYS.DATABASE_USER
    ),
    [KEYS.DATABASE_USER_PASSWORD]: parameterStore.getParameter(
      PARAMETER_KEYS.DATABASE_USER_PASSWORD
    ),
    [KEYS.LOG_LEVEL]: parameterStore.getParameter(PARAMETER_KEYS.LOG_LEVEL),
  }
  await ParameterStore.putParameters(gitHubApi.issue.number, worktreeParameters)
}
