import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './database/schema/*.ts',
  out: './database/migrations',
  dbCredentials: {
    // biome-ignore lint/style/noNonNullAssertion: drizzle-kitはCLI実行時にDATABASE_URLが必須
    url: process.env.DATABASE_URL!,
  },
})
