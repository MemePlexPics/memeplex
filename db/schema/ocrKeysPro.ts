import { mysqlTable, varchar, datetime } from 'drizzle-orm/mysql-core'

export const ocrKeysPro = mysqlTable('ocr_keys_pro', {
  ocrKey: varchar('ocr_key', { length: 255 }).primaryKey(),
  timeout: datetime('timeout', { mode: 'string' }),
})
