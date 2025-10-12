import { envConfig } from '@/config/env.js'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema.js'

const queryClient = postgres(envConfig.DATABASE_URL)

export const db = drizzle(queryClient, { schema })
