import { mysqlTable, bigint, varchar } from 'drizzle-orm/mysql-core'

// Includes users who only interact through inline search, without /start.
export const botUserLanguages = mysqlTable('bot_user_languages', {
  userId: bigint('user_id', { mode: 'number' }).primaryKey(),
  language: varchar('language', { length: 2 }).notNull(),
})
