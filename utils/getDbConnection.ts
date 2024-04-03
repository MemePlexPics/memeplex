import { drizzle } from 'drizzle-orm/mysql2'
import { getMysqlClient } from '.'
import { TDbConnection } from './types'

export const getDbConnection = async (): Promise<TDbConnection> => {
  const mysql = await getMysqlClient()
  const db = drizzle(mysql)
  // @ts-expect-error object restructuring didn't work that easy for types
  db.close = () => mysql.end()
  return db as TDbConnection
}
