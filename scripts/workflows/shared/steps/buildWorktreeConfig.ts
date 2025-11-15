import path from 'path'

import { AWS, PORTS } from '../constants.js'
import { WorktreeConfig } from '../types.js'
import { PROJECT_ROOT } from '../utils.js'

export function buildWorktreeConfig(issueNumber: number): WorktreeConfig {
  const branchName = `${AWS.PROFILE.PREFIX}-${issueNumber}`
  const databaseName = branchName.replace(/-/g, '_')
  const worktreePath = path.resolve(PROJECT_ROOT, '..', branchName)
  const webPort = PORTS.WEB_BASE + issueNumber
  const apiPort = PORTS.API_BASE + issueNumber

  return { branchName, databaseName, worktreePath, webPort, apiPort }
}
