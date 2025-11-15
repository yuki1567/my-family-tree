import { Database } from 'scripts/workflows/lib/Database.js'
import { DockerContainer } from 'scripts/workflows/lib/DockerContainer.js'
import { ParameterStore } from 'scripts/workflows/lib/ParameterStore.js'
import { PARAMETER_KEYS } from 'scripts/workflows/shared/constants.js'

export function cleanupInfrastructure(
  slugTitle: string,
  parameterStore: ParameterStore
): void {
  const database = new Database(
    slugTitle,
    parameterStore.getParameter(PARAMETER_KEYS.DATABASE_ADMIN_USER),
    parameterStore.getParameter(PARAMETER_KEYS.DATABASE_ADMIN_PASSWORD),
    parameterStore.getParameter(PARAMETER_KEYS.DATABASE_USER),
    parameterStore.getParameter(PARAMETER_KEYS.DATABASE_USER_PASSWORD)
  )

  const dockerContainer = new DockerContainer(`app-${slugTitle}`)

  dockerContainer.deleteDatabase(
    database.name,
    parameterStore.getParameter(PARAMETER_KEYS.DATABASE_ADMIN_PASSWORD)
  )

  dockerContainer.cleanup()
}
