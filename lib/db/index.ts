import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@127.0.0.1:5432/postgres'

const isProduction = process.env.NODE_ENV === 'production'

const globalForDb = globalThis as unknown as { client?: ReturnType<typeof postgres> }

const client = globalForDb.client ?? postgres(connectionString, {
  prepare: false,
  max: isProduction ? 1 : 5,
  idle_timeout: 20,
  ssl: connectionString.includes('sslmode=require') ? 'require' : (isProduction ? 'require' : false),
})

if (!isProduction) globalForDb.client = client

export const db = drizzle(client, { schema })
