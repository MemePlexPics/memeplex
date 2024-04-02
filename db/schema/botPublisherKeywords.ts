import { mysqlTable, varchar } from 'drizzle-orm/mysql-core'

export const botPublisherKeywords = mysqlTable('bot_publisher_keywords', {
  keyword: varchar('keyword', { length: 255 }).primaryKey()
})
