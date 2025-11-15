import {
  DeleteParameterCommand,
  type Parameter,
  PutParameterCommand,
  SSMClient,
  paginateGetParametersByPath,
} from '@aws-sdk/client-ssm'

import { AWS, WORKTREE_PARAMETERS } from '../shared/constants.js'
import { ParameterStoreError, WorktreeScriptError } from '../shared/errors.js'
import type {
  ParameterDescriptor,
  ParameterKey,
  Parameters,
  WorktreeParameterKey,
  WorktreeParameters,
} from '../shared/types.js'
import { log } from '../shared/utils.js'

export class ParameterStore {
  private constructor(
    private readonly _parameters: Parameters,
    private readonly _path: string
  ) {}

  public static async create(
    path: string,
    requiredKeys: readonly ParameterKey[]
  ): Promise<ParameterStore> {
    const client = this.createClient()
    const rawParams = await this.fetchParameters(client, path)
    const parameters = this.transformToMap(rawParams, path)

    const parameterStore = new ParameterStore(parameters, path)
    parameterStore.validateRequiredParameters(requiredKeys)

    return parameterStore
  }

  public getParameter(key: ParameterKey): string {
    const value = this._parameters[key]

    if (value === undefined) {
      throw new ParameterStoreError(
        `パラメータが見つかりません: ${key} (${this._path})`
      )
    }

    return value
  }

  get path(): string {
    return this._path
  }

  public validateRequiredParameters(keys: readonly ParameterKey[]): void {
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
    parameters: readonly Parameter[],
    path: string
  ): Parameters {
    return parameters.reduce<Parameters>((acc, parameter) => {
      const [key, value] = this.extractKeyValue(parameter, path)

      return {
        ...acc,
        [key]: value,
      }
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

  public async deleteParameters(): Promise<void> {
    log(`🔐 Parameter Store クリーンアップ開始: ${this._path}`)

    const client = ParameterStore.createClient()
    const parameterNames = Object.keys(this._parameters).map((key) =>
      this.reconstructParameterName(key)
    )

    const results = await Promise.all(
      parameterNames.map((name) => this.deleteSingleParameter(client, name))
    )

    const successCount = results.filter(Boolean).length
    const errorCount = results.length - successCount
    log(
      `Parameter Store削除完了: 成功 ${successCount}件, エラー ${errorCount}件`
    )
  }

  private reconstructParameterName(key: string): string {
    const paramName = key.toLowerCase().replace(/_/g, '-')
    return `${this._path}/${paramName}`
  }

  private async deleteSingleParameter(
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
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      log(
        `  ✗ ${name}を パラメータストアから削除に失敗しました: ${errorMessage}`
      )
      return false
    }
  }
}
