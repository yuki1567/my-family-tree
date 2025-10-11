import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { envConfig } from '@/config/env.js'
import * as schema from './schema/index.js'

const queryClient = postgres(envConfig.DATABASE_URL)

export const db = drizzle(queryClient, { schema })
