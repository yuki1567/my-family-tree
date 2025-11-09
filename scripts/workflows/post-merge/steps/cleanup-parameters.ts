import type { SSMClient } from '@aws-sdk/client-ssm'

import { deleteParametersByPath } from '../../../lib/aws-ssm.js'

export async function cleanupParameters(
  client: SSMClient,
  issueNumber: number
): Promise<void> {
  await deleteParametersByPath(client, issueNumber)
}
