import { mysqlTable, int, varchar, text, bigint } from 'drizzle-orm/mysql-core'
import { botUsers } from '.'

export const botMemeSuggestions = mysqlTable('bot_meme_suggestions', {
  id: int('id').autoincrement().primaryKey(),
  userId: bigint('user_id', { mode: 'number' })
    .notNull()
    .references(() => botUsers.id),
  fileId: varchar('file_id', { length: 255 }).unique().notNull(),
  text: text('text'),
  status: varchar('status', { length: 16, enum: ['approved', 'declined'] }),
})
