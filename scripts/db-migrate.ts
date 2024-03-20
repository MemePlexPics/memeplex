import { migrate } from 'drizzle-orm/mysql2/migrator'
import { drizzle } from 'drizzle-orm/mysql2'
import { getMysqlClient } from '../utils'
import * as schema from '../db/schema'

const client = await getMysqlClient()

await migrate(
  drizzle(client, {
    schema,
    mode: 'default'
  }),
  { migrationsFolder: './db/migrations' }
)

await client.end()
