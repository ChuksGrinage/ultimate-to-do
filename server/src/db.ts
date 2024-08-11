import { drizzle } from 'drizzle-orm/node-postgres'
import { Client } from 'pg'
import * as schema from './schema'

if (!process.env.DB_URL) {
  throw new Error('DB_URL not found!')
}

const client = new Client({
  connectionString: process.env.DB_URL,
})

await client.connect()
export const db = drizzle(client, { schema })
