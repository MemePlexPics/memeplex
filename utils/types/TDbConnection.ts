import { MySql2Database } from 'drizzle-orm/mysql2'

export type TDbConnection = MySql2Database<Record<string, never>> & {
  close: () => Promise<void>
}
