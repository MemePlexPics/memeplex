import { mysqlTable, int, varchar, tinyint } from 'drizzle-orm/mysql-core'

export const channels = mysqlTable('channels', {
  name: varchar('name', { length: 255 }).primaryKey(),
  availability: tinyint('availability').notNull(),
  // status: varchar('status', { length: 255 }).notNull(),
  withText: tinyint('with_text').notNull(),
  langs: varchar('langs', { length: 255 }).notNull(),
  timestamp: int('timestamp').notNull(),
})
