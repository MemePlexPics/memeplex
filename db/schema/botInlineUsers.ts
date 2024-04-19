import { mysqlTable, int, varchar, bigint } from 'drizzle-orm/mysql-core'

export const botInlineUsers = mysqlTable('bot_inline_users', {
  id: bigint('id', { mode: 'number' }).primaryKey(),
  user: varchar('user', { length: 255 }).notNull(),
  timestamp: int('timestamp').notNull(),
})
