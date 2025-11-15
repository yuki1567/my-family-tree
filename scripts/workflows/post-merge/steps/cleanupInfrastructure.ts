import { DockerContainer } from 'scripts/workflows/lib/DockerContainer.js'
import type { ParameterStore } from 'scripts/workflows/lib/ParameterStore.js'
import { PARAMETER_KEYS } from 'scripts/workflows/shared/constants.js'

export function cleanupInfrastructure(
  parameterStore: ParameterStore,
  appName: string,
  databaseName: string
): void {
  const dockerContainer = new DockerContainer(appName)

  dockerContainer.deleteDatabase(
    databaseName,
    parameterStore.getParameter(PARAMETER_KEYS.DATABASE_ADMIN_PASSWORD)
  )

  dockerContainer.cleanup()
}
