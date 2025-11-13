import {
  type Parameter,
  PutParameterCommand,
  SSMClient,
  paginateGetParametersByPath,
} from '@aws-sdk/client-ssm'

import { AWS, WORKTREE_PARAMETERS } from '../shared/constants.js'
import { ParameterStoreError, WorktreeScriptError } from '../shared/errors.js'
import type {
  ParameterDescriptor,
  WorktreeParameterKey,
  WorktreeParameters,
} from '../shared/types.js'
import { log } from '../shared/utils.js'

export class ParameterStore {
  private constructor(
    private readonly _parameters: Record<string, string>,
    private readonly _path: string
  ) {}

  public static async create(path: string): Promise<ParameterStore> {
    const client = this.createClient()
    const rawParams = await this.fetchParameters(client, path)
    const parameters = this.transformToMap(rawParams, path)
    return new ParameterStore(parameters, path)
  }

  public get(key: string): string {
    return this._parameters[key]!
  }

  public validateRequiredParameters(keys: readonly string[]): void {
    const missing = keys.filter((k) => !this._parameters[k])

    if (missing.length > 0) {
      throw new ParameterStoreError(
        `必須パラメータが見つかりません: ${missing.join(', ')} (${this._path})`
      )
    }
  }

  private static createClient(): SSMClient {
    const awsVault = process.env['AWS_VAULT']
    if (!awsVault) {
      throw new WorktreeScriptError(
        'AWS_VAULT環境変数が設定されていません。aws-vaultを使用してください'
      )
    }

    return new SSMClient()
  }

  private static async fetchParameters(
    client: SSMClient,
    path: string
  ): Promise<Parameter[]> {
    const paginator = paginateGetParametersByPath(
      { client },
      { Path: path, Recursive: true, WithDecryption: true }
    )

    const parameters: Parameter[] = []
    for await (const page of paginator) {
      if (page.Parameters) {
        parameters.push(...page.Parameters)
      }
    }

    return parameters
  }

  private static transformToMap(
    parameters: Parameter[],
    path: string
  ): Record<string, string> {
    return parameters.reduce<Record<string, string>>((acc, parameter) => {
      const [key, value] = this.extractKeyValue(parameter, path)
      acc[key] = value
      return acc
    }, {})
  }

  private static extractKeyValue(
    parameter: Parameter,
    path: string
  ): [string, string] {
    if (!parameter.Name || !parameter.Value) {
      throw new ParameterStoreError(
        `無効なパラメータ: Name=${parameter.Name}, Value=${parameter.Value}`
      )
    }

    const key = parameter.Name.replace(`${path}/`, '')
      .toUpperCase()
      .replace(/-/g, '_')
    return [key, parameter.Value]
  }

  public static async putParameters(
    issueNumber: number,
    parameters: WorktreeParameters
  ): Promise<void> {
    const client = this.createClient()
    const pathPrefix = `${AWS.PARAMETER_PATH.WORKTREE}/${issueNumber}`

    const descriptors = Object.entries(parameters).map(([key, value]) =>
      this.createParameterDescriptor(pathPrefix, key, value)
    )

    const results = await Promise.all(
      descriptors.map((descriptor) =>
        this.putSingleParameter(client, descriptor)
      )
    )

    const successCount = results.filter(Boolean).length
    const errorCount = results.length - successCount

    log(
      `Parameter Store登録完了: 成功 ${successCount}件, エラー ${errorCount}件`
    )
  }

  private static createParameterDescriptor(
    pathPrefix: string,
    key: string,
    value: string | number
  ): ParameterDescriptor {
    if (!this.isWorktreeParameterKey(key)) {
      throw new ParameterStoreError(`Invalid worktree parameter key: ${key}`)
    }

    return {
      key,
      value: String(value),
      name: `${pathPrefix}/${key}`,
      type: this.classifyParameterType(key),
    }
  }

  private static async putSingleParameter(
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
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      log(`  ✗ ${descriptor.key} の登録に失敗しました: ${errorMessage}`)
      return false
    }
  }

  private static isWorktreeParameterKey(
    key: string
  ): key is WorktreeParameterKey {
    const validateParameterKeys = new Set<string>(WORKTREE_PARAMETERS.ALL_KEYS)
    return validateParameterKeys.has(key)
  }

  private static classifyParameterType(
    key: WorktreeParameterKey
  ): 'String' | 'SecureString' {
    const secureKeys = new Set<string>(WORKTREE_PARAMETERS.SECURE_KEYS)
    return secureKeys.has(key) ? 'SecureString' : 'String'
  }
}
