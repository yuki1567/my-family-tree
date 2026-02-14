export type LogLevel = 'query' | 'info' | 'warn' | 'error'

type Config = {
  LOG_LEVEL: LogLevel[]
  DATABASE_URL: string
  JWT_SECRET: string
}

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
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
    process.exit(1)
  }

  const validLevels = levels.filter(isLogLevel)
  if (validLevels.length !== levels.length) {
    process.exit(1)
  }

  return validLevels
}

export const envConfig = {
  LOG_LEVEL: parseLogLevels(requireEnv('LOG_LEVEL')),
  DATABASE_URL: requireEnv('DATABASE_URL'),
  JWT_SECRET: requireEnv('JWT_SECRET'),
} as const satisfies Config
