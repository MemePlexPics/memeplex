import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core'

export const botTopicNames = mysqlTable('bot_topic_names', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).unique().notNull(),
})
