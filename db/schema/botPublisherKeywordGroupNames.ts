import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core'

export const botPublisherKeywordGroupNames = mysqlTable('bot_publisher_keyword_group_names', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).unique().notNull(),
})
