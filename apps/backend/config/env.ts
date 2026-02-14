export type LogLevel = 'query' | 'info' | 'warn' | 'error'

type Config = {
  LOG_LEVEL: LogLevel[]
  DATABASE_URL: string
  JWT_SECRET: string
}

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    // biome-ignore lint/suspicious/noConsole: 環境変数未設定時のエラー通知は運用上必要
    console.error(`環境変数${key}が設定されていません`)
    process.exit(1)
  }
  return value
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
    // biome-ignore lint/suspicious/noConsole: 設定エラー時のエラー通知は運用上必要
    console.error(
      'LOG_LEVEL が空です。少なくとも1つの値を指定してください (例: query,info,warn,error)'
    )
    process.exit(1)
  }

  const validLevels = levels.filter(isLogLevel)
  if (validLevels.length !== levels.length) {
    // biome-ignore lint/suspicious/noConsole: 設定エラー時のエラー通知は運用上必要
    console.error(
      `LOG_LEVEL に無効な値が含まれています: 有効なのは query, info, warn, error です。`
    )
    process.exit(1)
  }

  return validLevels
}

export const envConfig = {
  LOG_LEVEL: parseLogLevels(requireEnv('LOG_LEVEL')),
  DATABASE_URL: requireEnv('DATABASE_URL'),
  JWT_SECRET: requireEnv('JWT_SECRET'),
} as const satisfies Config
