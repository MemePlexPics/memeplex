import process from 'process'
import { defineConfig } from 'drizzle-kit'

if (!process.env.DB_HOST || !process.env.DB_DATABASE || !process.env.DB_PORT) throw new Error(JSON.stringify(process.env, null, 2))

export default defineConfig({
  schema: './db/schema',
  out: './db/migrations',
  driver: 'mysql2',
  dbCredentials: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
})
