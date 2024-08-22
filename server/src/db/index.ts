import { drizzle } from 'drizzle-orm/node-postgres'
import { Client } from 'pg'
import * as schema from '../schema'

// const client = new Client({
//   //   host: process.env.DB_HOST,
//   host: '127.0.0.1',
//   port: 5432,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// })

const client = new Client({
  connectionString:
    'postgresql://chuksgrinage@localhost:5432/ultimate_to_do_db',
})

await client.connect()
export const db = drizzle(client, { schema })

console.log('Server is running with Drizzle ORM')
