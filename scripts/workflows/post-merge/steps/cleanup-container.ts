import { cleanupWorktreeContainer } from '../../lib/docker.js'
import type { WorktreeConfig } from '../../shared/types.js'

export function cleanupContainer(config: WorktreeConfig): void {
  if (config.appName) {
    cleanupWorktreeContainer(config.appName)
  }
}
