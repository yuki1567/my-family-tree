import path from 'path'

import { PORTS } from '../../shared/constants.js'
import { WorktreeConfig } from '../../shared/types.js'
import { PROJECT_ROOT } from '../../shared/utils.js'

export function buildWorktreeConfig(
  issueNumber: number,
  label: string,
  slugTitle: string
): WorktreeConfig {
  const branchName = `${label}/${issueNumber}-${slugTitle}`
  const worktreePath = path.resolve(
    PROJECT_ROOT,
    '..',
    label,
    `${issueNumber}-${slugTitle}`
  )
  const webPort = PORTS.WEB_BASE + issueNumber
  const apiPort = PORTS.API_BASE + issueNumber

  return { branchName, worktreePath, webPort, apiPort }
}
