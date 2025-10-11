import { defineConfig } from 'drizzle-kit'
import { envConfig } from './config/env.js'

export default defineConfig({
  dialect: 'postgresql',
  schema: ['./database/schema/*.ts'],
  out: './database/migrations',
  dbCredentials: {
    url: envConfig.DATABASE_URL,
  },
})
