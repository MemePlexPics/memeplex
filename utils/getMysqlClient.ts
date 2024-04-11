import 'dotenv/config'
import mysql from 'mysql2/promise'

export const getMysqlClient = async (options?: { connectTimeout: number }) => {
  const client = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectTimeout: options?.connectTimeout || 10_000,
  })

  return client
}
