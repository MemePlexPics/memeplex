import { mysqlTable, int, varchar } from 'drizzle-orm/mysql-core'

export const featuredChannels = mysqlTable('featured_channels', {
  username: varchar('username', { length: 255 }).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  timestamp: int('timestamp').notNull(),
  comment: varchar('comment', { length: 255 }),
})
