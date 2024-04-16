import { mysqlTable, int, varchar } from 'drizzle-orm/mysql-core'

export const botInlineUsers = mysqlTable('bot_inline_users', {
  id: int('id').primaryKey(),
  user: varchar('user', { length: 255 }).notNull(),
  timestamp: int('timestamp').notNull(),
})
