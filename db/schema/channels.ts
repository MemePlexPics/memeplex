import { mysqlTable, int, varchar, tinyint } from 'drizzle-orm/mysql-core'

export const channels = mysqlTable('channels', {
  name: varchar('name', { length: 255 }).notNull(),
  availability: tinyint('availability').notNull(),
  langs: varchar('langs', { length: 255 }).notNull(),
  timestamp: int('timestamp').notNull(),
})
