import {
  type GetParametersByPathCommandOutput,
  type Parameter,
  SSMClient,
  paginateGetParametersByPath,
} from '@aws-sdk/client-ssm'

import { AWS } from '../../shared/constants.js'
import {
  ParameterStoreError,
  WorktreeScriptError,
} from '../../shared/errors.js'
import { log } from '../../shared/utils.js'

export type InitializeOutput = {
  ssmClient: SSMClient
  githubProjects: {
    projectId: string
    projectNumber: number
    statusFieldId: string
    todoStatusId: string
    inProgressStatusId: string
    inReviewStatusId: string
  }
  cloudTranslation: string
  environment: {
    dbAdminUser: string
    dbAdminPassword: string
    dbUser: string
    dbUserPassword: string
  }
}

export async function initialize(): Promise<InitializeOutput> {
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

function createSSMClient(): SSMClient {
  const awsVault = process.env['AWS_VAULT']
  if (!awsVault) {
    throw new WorktreeScriptError(
      'AWS_VAULT環境変数が設定されていません。aws-vaultを使用してください'
    )
  }

  const region = process.env['AWS_REGION']
  if (!region) {
    throw new WorktreeScriptError('AWS_REGION環境変数が設定されていません')
  }

  return new SSMClient({ region })
}

async function loadParametersFromStore(
  client: SSMClient
): Promise<Record<string, string>> {
  const parameterPath = AWS.PARAMETER_PATH.DEVELOPMENT

  const pages = await fetchParameterPages(client, parameterPath)
  const parameters = collectParameters(pages)

  if (parameters.length === 0) {
    throw new ParameterStoreError(
      `Parameter Store にパラメータが見つかりません: ${parameterPath}`
    )
  }

  const entries = parameters.map((param) => toEntry(param, parameterPath))
  const parameterMap = Object.fromEntries(entries)

  log(`✓ Parameter Storeから${parameters.length}個のパラメータを読み込みました`)

  return parameterMap
}

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

function collectParameters(
  pages: GetParametersByPathCommandOutput[]
): Parameter[] {
  return pages.flatMap((page) => page.Parameters ?? [])
}

function toEntry(
  parameter: Parameter,
  parameterPath: string
): [string, string] {
  if (!parameter.Value) {
    throw new ParameterStoreError(`パラメータの値が空です: ${parameter.Name}`)
  }
  return [convertToEnvName(parameter, parameterPath), parameter.Value]
}

function convertToEnvName(param: Parameter, basePath: string): string {
  if (!param.Name) {
    throw new ParameterStoreError('パラメータ名が未定義です')
  }
  const paramName = param.Name.replace(`${basePath}/`, '')
  return paramName.toUpperCase().replace(/-/g, '_')
}

function getRequiredParameter(
  params: Record<string, string>,
  key: string
): string {
  const value = params[key]
  if (!value) {
    throw new ParameterStoreError(
      `必須パラメータが見つかりません: ${key} (${AWS.PARAMETER_PATH.DEVELOPMENT})`
    )
  }
  return value
}
