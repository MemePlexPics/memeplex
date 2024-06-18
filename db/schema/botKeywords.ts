import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core'

export const botKeywords = mysqlTable('bot_keywords', {
  id: int('id').autoincrement().primaryKey(),
  keyword: varchar('keyword', { length: 255 }).unique().notNull(),
})
