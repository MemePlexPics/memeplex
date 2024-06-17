import process from 'process'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './db/schema',
  out: './db/migrations',
  dialect: 'mysql',
  dbCredentials: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
})
