type Config = {
  NODE_ENV: string
  API_PORT: number
  DATABASE_URL: string
  TEST_DATABASE_URL: string
  JWT_SECRET: string
}

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    console.error(`環境変数${key}が設定されていません`)
    process.exit(1)
  }
  return value
}

export const envConfig = {
  NODE_ENV: requireEnv('NODE_ENV'),
  API_PORT: Number(requireEnv('API_PORT')),
  DATABASE_URL: requireEnv('DATABASE_URL'),
  TEST_DATABASE_URL: requireEnv('TEST_DATABASE_URL'),
  JWT_SECRET: requireEnv('JWT_SECRET'),
} as const satisfies Config
