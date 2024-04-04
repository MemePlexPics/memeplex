import { mysqlTable, varchar, datetime } from 'drizzle-orm/mysql-core'

export const ocrKeys = mysqlTable('ocr_keys', {
  ocrKey: varchar('ocr_key', { length: 255 }).primaryKey(),
  timeout: datetime('timeout', { mode: 'string' }).default('NULL'),
})
