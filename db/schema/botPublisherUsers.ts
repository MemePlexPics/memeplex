import { mysqlTable, int, varchar, bigint } from 'drizzle-orm/mysql-core'

export const botPublisherUsers = mysqlTable('bot_publisher_users', {
  id: bigint('id', { mode: 'number' }).primaryKey(),
  user: varchar('user', { length: 255 }).notNull(),
  keywordsCount: int('keywords_count'),
  timestamp: int('timestamp').notNull(),
})
