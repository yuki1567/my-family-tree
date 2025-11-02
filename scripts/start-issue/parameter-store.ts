import {
  type GetParametersByPathCommandOutput,
  type Parameter,
  SSMClient,
  paginateGetParametersByPath,
} from '@aws-sdk/client-ssm'

import { log } from './context.js'

/**
 * Parameter Storeから開発環境のパラメータを取得
 * @returns パラメータ名と値のマップ（キーは大文字・アンダースコア形式）
 */
export async function loadParametersFromStore(): Promise<
  Record<string, string>
> {
  const awsVault = process.env['AWS_VAULT']
  if (!awsVault) {
    throw new Error(
      'AWS_VAULT環境変数が設定されていません。\n' +
        'このスクリプトはaws-vault経由で実行する必要があります。\n' +
        '実行例: aws-vault exec family-tree-dev -- npm run start:issue'
    )
  }

  const region = process.env['AWS_REGION']
  if (!region) {
    throw new Error(
      'AWS_REGION環境変数が設定されていません。\n' +
        'aws-vaultの設定を確認してください。'
    )
  }

  const parameterPath = '/family-tree/development'
  const client = new SSMClient({ region })

  try {
    const pages = await fetchParameterPages(client, parameterPath)
    const parameters = collectParameters(pages)
    const validParameters = ensureNotEmpty(parameters, parameterPath)
    const entries = validParameters.map((param) =>
      toEntry(param, parameterPath)
    )
    const parameterMap = Object.fromEntries(entries)

    log(
      `✓ Parameter Storeから${validParameters.length}個のパラメータを読み込みました`
    )

    return parameterMap
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Parameter Storeからの読み込みに失敗しました: ${error.message}\n` +
          `AWS認証情報とParameter Storeへのアクセス権限を確認してください。`
      )
    }
    throw error
  }
}

/**
 * パラメータマップから必須の値を取得
 * @throws 値が存在しない場合はエラー
 */
export function getRequiredParameter(
  params: Record<string, string>,
  key: string
): string {
  const value = params[key]
  if (!value) {
    throw new Error(
      `必須パラメータ ${key} がParameter Storeに設定されていません。\n` +
        `Parameter Storeパス: /family-tree/development/${key.toLowerCase().replace(/_/g, '-')}`
    )
  }
  return value
}

/**
 * Parameter Storeから全ページのパラメータを取得
 */
async function fetchParameterPages(
  client: SSMClient,
  parameterPath: string
): Promise<GetParametersByPathCommandOutput[]> {
  const paginator = paginateGetParametersByPath(
    { client },
    { Path: parameterPath, Recursive: true, WithDecryption: true }
  )

  const pages: GetParametersByPathCommandOutput[] = []
  for await (const page of paginator) {
    pages.push(page)
  }
  return pages
}

/**
 * ページからパラメータを収集
 */
function collectParameters(
  pages: GetParametersByPathCommandOutput[]
): Parameter[] {
  return pages.flatMap((page) => page.Parameters ?? [])
}

/**
 * パラメータが空でないことを確認
 */
function ensureNotEmpty(
  parameters: Parameter[],
  parameterPath: string
): Parameter[] {
  if (parameters.length) return parameters
  throw new Error(
    `Parameter Storeにパラメータが見つかりません。\n` +
      `パス: ${parameterPath}\n` +
      `scripts/ssm/register-params.sh でパラメータを登録してください。`
  )
}

/**
 * パラメータを環境変数形式のエントリに変換
 */
function toEntry(
  parameter: Parameter,
  parameterPath: string
): [string, string] {
  if (!parameter.Value) {
    throw new Error(
      `パラメータ ${parameter.Name} の値が空です。\n` +
        `Parameter Storeの設定を確認してください。`
    )
  }
  return [convertToEnvName(parameter, parameterPath), parameter.Value]
}

/**
 * Parameter Store のパラメータ名を環境変数名に変換
 * 例: /family-tree/development/database-url → DATABASE_URL
 */
function convertToEnvName(param: Parameter, basePath: string): string {
  if (!param.Name) {
    throw new Error(
      `パラメータ名が未定義です。Parameter Storeのデータを確認してください。`
    )
  }
  const paramName = param.Name.replace(`${basePath}/`, '')
  return paramName.toUpperCase().replace(/-/g, '_')
}
