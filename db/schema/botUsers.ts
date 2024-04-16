import { mysqlTable, int, varchar } from 'drizzle-orm/mysql-core'

export const botUsers = mysqlTable('bot_users', {
  id: int('id').primaryKey(),
  user: varchar('user', { length: 255 }).notNull(),
  timestamp: int('timestamp').notNull(),
})
