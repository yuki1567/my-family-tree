import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const exec = promisify(execFile)

type LogLevel = 'query' | 'info' | 'warn' | 'error'

type Config = {
  TEST_DATABASE_URL: string
  TEST_LOG_LEVEL: LogLevel[]
}

type SsmParameter = {
  Name: string
  Value: string
}

export const envConfig = await initEnvConfig()

async function initEnvConfig(): Promise<Config> {
  await loadParameterStore()

  return {
    TEST_DATABASE_URL: requireEnv('DATABASE_URL'),
    TEST_LOG_LEVEL: parseLogLevels(requireEnv('LOG_LEVEL')),
  }
}

async function loadParameterStore(): Promise<void> {
  const awsVault = process.env.AWS_VAULT
  const awsRegion = process.env.AWS_REGION

  if (!awsVault) {
    throw new Error(
      'AWS_VAULTが設定されていません。テスト実行にはParameter Storeへのアクセスが必要です。'
    )
  }

  if (!awsRegion) {
    throw new Error(
      'AWS_REGIONが設定されていません。テスト実行にはParameter Storeへのアクセスが必要です。'
    )
  }

  const paramPath = judgeEnvironment(awsVault)

  console.log(`[Test Setup] Parameter Storeから環境変数を取得中: ${paramPath}`)

  const parameters = await getParameters(paramPath, awsRegion)

  setParameters(parameters, paramPath)

  console.log(
    `[Test Setup] ${parameters.length} 件の環境変数をエクスポート完了`
  )
}

function judgeEnvironment(awsVault: string): string {
  const praamPathRoot = '/family-tree'

  if (awsVault.includes('-worktree-')) {
    const issueNumber = awsVault.split('-worktree-')[1]
    if (!issueNumber) throw new Error(`不明なworktree番号: ${awsVault}`)
    return `${praamPathRoot}/worktree/${issueNumber}`
  }

  if (awsVault.endsWith('-dev')) return `${praamPathRoot}/development`
  if (awsVault.endsWith('-test')) return `${praamPathRoot}/test`
  if (awsVault.endsWith('-prod')) return `${praamPathRoot}/production`

  throw new Error(`不明なAWS_VAULT形式: ${awsVault}`)
}

async function getParameters(
  paramPath: string,
  awsRegion: string
): Promise<ReadonlyArray<SsmParameter>> {
  const maxPages = 10
  const baseArgs = [
    'ssm',
    'get-parameters-by-path',
    '--with-decryption',
    '--output',
    'json',
    '--path',
    paramPath,
    '--region',
    awsRegion,
  ] as const

  const loop = async (
    nextToken: string | undefined,
    page: number,
    acc: ReadonlyArray<SsmParameter>
  ): Promise<ReadonlyArray<SsmParameter>> => {
    if (page >= maxPages) return acc

    const args = [
      ...baseArgs,
      ...(nextToken ? ['--next-token', nextToken] : []),
    ]

    const { stdout } = await exec('aws', args)
    const { Parameters: parameters = [], NextToken: awsNextToken } =
      JSON.parse(stdout)

    const acc2 = parameters.length ? [...acc, ...parameters] : acc
    return awsNextToken ? loop(awsNextToken, page + 1, acc2) : acc2
  }

  return loop(undefined, 0, [])
}

function setParameters(
  parameters: ReadonlyArray<SsmParameter>,
  paramPath: string
): void {
  for (const { Name: name, Value: value } of parameters) {
    const paramKey = name.replace(`${paramPath}/`, '')

    const envKey = paramKey.toUpperCase().replace(/-/g, '_')

    process.env[envKey] = value
  }
}

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`環境変数${key}が設定されていません`)
  }
  const trimmedValue = value.trim()
  if (trimmedValue.length === 0) {
    throw new Error(`環境変数${key}の値が空白文字のみです`)
  }
  return trimmedValue
}

function isLogLevel(value: string): value is LogLevel {
  return ['query', 'info', 'warn', 'error'].includes(value)
}

function parseLogLevels(rawValue: string): LogLevel[] {
  const levels = rawValue
    .split(',')
    .map((level) => level.trim())
    .filter((level) => level.length > 0)

  if (levels.length === 0) {
    throw new Error(
      'LOG_LEVEL が空です。少なくとも1つの値を指定してください (例: query,info,warn,error)'
    )
  }

  const validLevels = levels.filter(isLogLevel)
  if (validLevels.length !== levels.length) {
    throw new Error(
      `LOG_LEVEL に無効な値が含まれています: 有効なのは query, info, warn, error です。`
    )
  }

  return validLevels
}
