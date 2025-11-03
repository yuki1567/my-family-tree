import {
  type GetParametersByPathCommandOutput,
  type Parameter,
  SSMClient,
  paginateGetParametersByPath,
} from '@aws-sdk/client-ssm'

import { AWS } from '../core/constants.js'
import {
  AWSAuthenticationError,
  ParameterNameUndefinedError,
  ParameterNotFoundError,
  ParameterValueEmptyError,
  ParametersEmptyError,
} from '../core/errors.js'
import type { InitializeContextOutput } from '../core/types.js'
import { log } from '../core/utils.js'

export async function initializeContext(): Promise<InitializeContextOutput> {
  const ssmClient = createSSMClient()
  const parameters = await loadParametersFromStore(ssmClient)

  log('Parameter Storeからパラメータを読み込み、コンテキストを初期化しました')
  return {
    ssmClient,
    githubProjects: {
      projectId: getRequiredParameter(parameters, 'GITHUB_PROJECT_ID'),
      projectNumber: Number(
        getRequiredParameter(parameters, 'GITHUB_PROJECT_NUMBER')
      ),
      statusFieldId: getRequiredParameter(parameters, 'GITHUB_STATUS_FIELD_ID'),
      todoStatusId: getRequiredParameter(parameters, 'GITHUB_TODO_STATUS_ID'),
      inProgressStatusId: getRequiredParameter(
        parameters,
        'GITHUB_INPROGRESS_STATUS_ID'
      ),
      inReviewStatusId: getRequiredParameter(
        parameters,
        'GITHUB_INREVIEW_STATUS_ID'
      ),
    },
    cloudTranslation: getRequiredParameter(
      parameters,
      'GOOGLE_TRANSLATE_API_KEY'
    ),
    environment: {
      dbAdminUser: getRequiredParameter(parameters, 'DATABASE_ADMIN_USER'),
      dbAdminPassword: getRequiredParameter(
        parameters,
        'DATABASE_ADMIN_PASSWORD'
      ),
      dbUser: getRequiredParameter(parameters, 'DATABASE_USER'),
      dbUserPassword: getRequiredParameter(
        parameters,
        'DATABASE_USER_PASSWORD'
      ),
    },
  }
}

/**
 * AWS認証情報を確認してSSMClientを生成
 */
function createSSMClient(): SSMClient {
  const awsVault = process.env['AWS_VAULT']
  if (!awsVault) {
    throw new AWSAuthenticationError('AWS_VAULT')
  }

  const region = process.env['AWS_REGION']
  if (!region) {
    throw new AWSAuthenticationError('AWS_REGION')
  }

  return new SSMClient({ region })
}

/**
 * Parameter Storeから開発環境のパラメータを取得
 * @returns パラメータ名と値のマップ(キーは大文字・アンダースコア形式)
 */
async function loadParametersFromStore(
  client: SSMClient
): Promise<Record<string, string>> {
  const parameterPath = AWS.PARAMETER_PATH.DEVELOPMENT

  const pages = await fetchParameterPages(client, parameterPath)
  const parameters = collectParameters(pages)
  const validParameters = ensureNotEmpty(parameters, parameterPath)
  const entries = validParameters.map((param) => toEntry(param, parameterPath))
  const parameterMap = Object.fromEntries(entries)

  log(
    `✓ Parameter Storeから${validParameters.length}個のパラメータを読み込みました`
  )

  return parameterMap
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
  throw new ParametersEmptyError(parameterPath)
}

/**
 * パラメータを環境変数形式のエントリに変換
 */
function toEntry(
  parameter: Parameter,
  parameterPath: string
): [string, string] {
  if (!parameter.Value) {
    throw new ParameterValueEmptyError(parameter.Name)
  }
  return [convertToEnvName(parameter, parameterPath), parameter.Value]
}

/**
 * Parameter Store のパラメータ名を環境変数名に変換
 * 例: /family-tree/development/database-url → DATABASE_URL
 */
function convertToEnvName(param: Parameter, basePath: string): string {
  if (!param.Name) {
    throw new ParameterNameUndefinedError()
  }
  const paramName = param.Name.replace(`${basePath}/`, '')
  return paramName.toUpperCase().replace(/-/g, '_')
}

/**
 * パラメータマップから必須の値を取得
 * @throws 値が存在しない場合はエラー
 */
function getRequiredParameter(
  params: Record<string, string>,
  key: string
): string {
  const value = params[key]
  if (!value) {
    throw new ParameterNotFoundError(key, AWS.PARAMETER_PATH.DEVELOPMENT)
  }
  return value
}
