import type { AwsProfile } from 'scripts/workflows/lib/AwsProfile.js'
import type { DockerContainer } from 'scripts/workflows/lib/DockerContainer.js'

export function setupInfrastructure(
  awsProfile: AwsProfile,
  dockerContainer: DockerContainer,
  databaseName: string,
  adminPassword: string
): void {
  awsProfile.create()
  dockerContainer.createDatabase(databaseName, adminPassword)
}
