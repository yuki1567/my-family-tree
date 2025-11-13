import {
  type Parameter,
  SSMClient,
  paginateGetParametersByPath,
} from '@aws-sdk/client-ssm'

import { ParameterStoreError, WorktreeScriptError } from '../shared/errors.js'
import type {
  ParameterDescriptor,
  WorktreeParameters,
} from '../shared/types.js'

export class ParameterStore {
  private constructor(
    private readonly _parameters: Record<string, string>,
    private readonly _path: string
  ) {}

  public static async create(path: string): Promise<ParameterStore> {
    const client = ParameterStore.createClient()
    const rawParams = await ParameterStore.fetchParameters(client, path)
    const parameters = ParameterStore.transformToMap(rawParams, path)
    return new ParameterStore(parameters, path)
  }

  public get(key: string): string {
    return this._parameters[key]!
  }

  public validateRequiredParameters(keys: string[]): void {
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
      const [key, value] = ParameterStore.extractKeyValue(parameter, path)
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

  async putWorktreeParameters(
    _issueNumber: number,
    _params: WorktreeParameters
  ): Promise<void> {
    throw new Error('Not implemented')
  }

  async deleteWorktreeParameters(_issueNumber: number): Promise<void> {
    throw new Error('Not implemented')
  }

  private extractParameter(
    _params: Parameter[],
    _key: string,
    _basePath: string
  ): string {
    throw new Error('Not implemented')
  }

  private createParameterDescriptor(
    _pathPrefix: string,
    _key: string,
    _value: string
  ): ParameterDescriptor {
    throw new Error('Not implemented')
  }

  private async putSingleParameter(
    _descriptor: ParameterDescriptor
  ): Promise<boolean> {
    throw new Error('Not implemented')
  }

  private async deleteSingleParameter(_name: string): Promise<boolean> {
    throw new Error('Not implemented')
  }
}
