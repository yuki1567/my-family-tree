import { deleteDatabase } from '../../../lib/database.js'
import type { WorktreeConfig } from '../../../shared/types.js'

export function cleanupDatabase(config: WorktreeConfig): void {
  deleteDatabase(config.databaseName, config.databaseAdminPassword)
}
