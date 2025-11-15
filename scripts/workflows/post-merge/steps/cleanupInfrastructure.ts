import { Database } from 'scripts/workflows/lib/Database.js'
import { DockerContainer } from 'scripts/workflows/lib/DockerContainer.js'
import { ParameterStore } from 'scripts/workflows/lib/ParameterStore.js'
import { AWS, PARAMETER_KEYS } from 'scripts/workflows/shared/constants.js'

export function cleanupInfrastructure(
  parameterStore: ParameterStore,
  issueNumber: number
): void {
  const appName = `${AWS.PROFILE.PREFIX}-${issueNumber}`
  const dockerContainer = new DockerContainer(appName)
  const database = new Database(
    appName.replace(/-/g, '_'),
    parameterStore.getParameter(PARAMETER_KEYS.DATABASE_ADMIN_USER),
    parameterStore.getParameter(PARAMETER_KEYS.DATABASE_ADMIN_PASSWORD),
    parameterStore.getParameter(PARAMETER_KEYS.DATABASE_USER),
    parameterStore.getParameter(PARAMETER_KEYS.DATABASE_USER_PASSWORD)
  )

  dockerContainer.deleteDatabase(
    database.name,
    parameterStore.getParameter(PARAMETER_KEYS.DATABASE_ADMIN_PASSWORD)
  )

  dockerContainer.cleanup()
}
