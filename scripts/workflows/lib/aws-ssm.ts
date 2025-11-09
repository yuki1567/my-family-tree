import {
  DeleteParameterCommand,
  GetParameterCommand,
  GetParametersByPathCommand,
  type Parameter,
  PutParameterCommand,
  type SSMClient,
} from '@aws-sdk/client-ssm'

import { AWS, WORKTREE_PARAMETERS } from '../shared/constants.js'
import { ParameterStoreError } from '../shared/errors.js'
import type {
  ParameterDescriptor,
  WorktreeParameterKey,
  WorktreeParameters,
} from '../shared/types.js'
import { log } from '../shared/utils.js'

export async function getDevelopmentParameters(client: SSMClient): Promise<{
  dbAdminUser: string
  dbAdminPassword: string
  dbUser: string
  dbUserPassword: string
}> {
  const path = AWS.PARAMETER_PATH.DEVELOPMENT

  const params = await getParametersByPath(client, path)

  const getParam = (key: string): string => {
    const param = params.find((p) => p.Name?.endsWith(`/${key}`))
    if (!param?.Value) {
      throw new ParameterStoreError(
        `Parameter "${key}" が見つかりません: ${path}`
      )
    }
    return param.Value
  }

  return {
    dbAdminUser: getParam('database-admin-user'),
    dbAdminPassword: getParam('database-admin-password'),
    dbUser: getParam('database-user'),
    dbUserPassword: getParam('database-user-password'),
  }
}

export async function getParametersByPath(
  client: SSMClient,
  path: string
): Promise<Parameter[]> {
  try {
    const response = await client.send(
      new GetParametersByPathCommand({
        Path: path,
        Recursive: true,
        WithDecryption: true,
      })
    )
    return response.Parameters || []
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new ParameterStoreError(
      `Parameter Store取得エラー (${path}): ${errorMessage}`
    )
  }
}

export async function getParameter(
  client: SSMClient,
  name: string
): Promise<string> {
  try {
    const response = await client.send(
      new GetParameterCommand({
        Name: name,
        WithDecryption: true,
      })
    )
    if (!response.Parameter?.Value) {
      throw new ParameterStoreError(`パラメータが空です: ${name}`)
    }
    return response.Parameter.Value
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new ParameterStoreError(
      `Parameter Store取得エラー (${name}): ${errorMessage}`
    )
  }
}

export async function putParameters(
  client: SSMClient,
  issueNumber: number,
  params: WorktreeParameters
): Promise<void> {
  const pathPrefix = `${AWS.PARAMETER_PATH.WORKTREE}/${issueNumber}`

  log(`Parameter Storeにパラメータを登録中... (Path: ${pathPrefix})`)

  const descriptors = Object.entries(params).map(([key, value]) =>
    createParameterDescriptor(pathPrefix, key, value)
  )

  const results = await Promise.all(
    descriptors.map((descriptor) => putSingleParameter(client, descriptor))
  )

  const successCount = results.filter(Boolean).length
  const errorCount = results.length - successCount

  log(`Parameter Store登録完了: 成功 ${successCount}件, エラー ${errorCount}件`)
}

async function putSingleParameter(
  client: SSMClient,
  descriptor: ParameterDescriptor
): Promise<boolean> {
  try {
    await client.send(
      new PutParameterCommand({
        Name: descriptor.name,
        Value: descriptor.value,
        Type: descriptor.type,
        Overwrite: true,
      })
    )
    log(`  ✓ ${descriptor.key} を登録しました (Type: ${descriptor.type})`)
    return true
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    log(`  ✗ ${descriptor.key} の登録に失敗しました: ${errorMessage}`)
    return false
  }
}

export async function deleteParametersByPath(
  client: SSMClient,
  issueNumber: number
): Promise<void> {
  const pathPrefix = `${AWS.PARAMETER_PATH.WORKTREE}/${issueNumber}`

  log(`🔐 Parameter Store クリーンアップ開始: ${pathPrefix}`)

  const params = await getParametersByPath(client, pathPrefix)

  if (params.length === 0) {
    log('ℹ️ 削除対象のParameter Storeパラメータは見つかりませんでした')
    return
  }

  log(`🗑 Parameter Store パラメータ削除: ${params.length} 件`)

  const results = await Promise.all(
    params.map((param) => deleteSingleParameter(client, param.Name!))
  )

  const successCount = results.filter(Boolean).length
  log(
    `✅ Parameter Store クリーンアップ完了: ${successCount}/${params.length} 件削除`
  )
}

async function deleteSingleParameter(
  client: SSMClient,
  name: string
): Promise<boolean> {
  try {
    await client.send(
      new DeleteParameterCommand({
        Name: name,
      })
    )
    return true
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    log(`  ✗ Parameter Store パラメータ削除に失敗しました: ${name}`)
    log(`     ${errorMessage}`)
    return false
  }
}

function createParameterDescriptor(
  pathPrefix: string,
  key: string,
  value: string
): ParameterDescriptor {
  if (!isWorktreeParameterKey(key)) {
    throw new ParameterStoreError(`Invalid worktree parameter key: ${key}`)
  }

  return {
    key,
    value,
    name: `${pathPrefix}/${key}`,
    type: classifyParameterType(key),
  }
}

const VALID_WORKTREE_KEYS = new Set<string>(WORKTREE_PARAMETERS.ALL_KEYS)
const SECURE_KEYS = new Set<string>(WORKTREE_PARAMETERS.SECURE_KEYS)

function isWorktreeParameterKey(key: string): key is WorktreeParameterKey {
  return VALID_WORKTREE_KEYS.has(key)
}

function classifyParameterType(
  key: WorktreeParameterKey
): 'String' | 'SecureString' {
  return SECURE_KEYS.has(key) ? 'SecureString' : 'String'
}
