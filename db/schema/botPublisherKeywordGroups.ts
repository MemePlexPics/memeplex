import { mysqlTable, text, varchar } from 'drizzle-orm/mysql-core'

export const botPublisherKeywordGroups = mysqlTable('bot_publisher_keyword_groups', {
  name: varchar('name', { length: 255 }).primaryKey(),
  keywords: text('keywords').notNull(),
})
