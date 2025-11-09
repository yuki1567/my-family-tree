import { SSMClient } from '@aws-sdk/client-ssm'

import { getParametersByPath } from '../../lib/aws-ssm.js'
import { AWS } from '../../shared/constants.js'
import { ParameterStoreError } from '../../shared/errors.js'
import type { WorktreeConfig } from '../../shared/types.js'
import { log } from '../../shared/utils.js'

export async function loadWorktreeConfig(
  client: SSMClient,
  issueNumber: number
): Promise<WorktreeConfig | null> {
  const pathPrefix = `${AWS.PARAMETER_PATH.WORKTREE}/${issueNumber}`

  try {
    const params = await getParametersByPath(client, pathPrefix)

    if (params.length === 0) {
      log(
        'ℹ️ Parameter Storeにworktree設定が見つかりません（ドキュメントonlyのissue）'
      )
      return null
    }

    const getParam = (key: string): string => {
      const param = params.find((p) => p.Name?.endsWith(`/${key}`))
      if (!param?.Value) {
        throw new ParameterStoreError(
          `パラメータ "${key}" が見つかりません: ${pathPrefix}`
        )
      }
      return param.Value
    }

    const getOptionalParam = (key: string): string | undefined => {
      const param = params.find((p) => p.Name?.endsWith(`/${key}`))
      return param?.Value
    }

    return {
      issueNumber,
      branchName: getParam('branch-name'),
      webPort: Number.parseInt(getParam('web-port'), 10),
      apiPort: Number.parseInt(getParam('api-port'), 10),
      databaseName: getParam('database-name'),
      databaseUrl: getParam('database-url'),
      databaseAdminUrl: getParam('database-admin-url'),
      databaseAdminUser: getParam('database-admin-user'),
      databaseAdminPassword: getParam('database-admin-password'),
      databaseUser: getParam('database-user'),
      databaseUserPassword: getParam('database-user-password'),
      appName: getOptionalParam('app-name'),
      awsProfileName: `${AWS.PROFILE.PREFIX}-${issueNumber}`,
    }
  } catch (error) {
    if (error instanceof ParameterStoreError) {
      throw error
    }
    log('ℹ️ Parameter Store読み込み中にエラーが発生しました')
    return null
  }
}
