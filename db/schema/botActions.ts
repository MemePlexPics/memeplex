import { mysqlTable, index, int, varchar } from 'drizzle-orm/mysql-core'
import { botUsers } from '.'

export const botActions = mysqlTable(
  'bot_actions',
  {
    id: int('id').autoincrement().primaryKey(),
    userId: int('user_id')
      .notNull()
      .references(() => botUsers.id, {
        onDelete: 'restrict',
        onUpdate: 'restrict',
      }),
    action: varchar('action', {
      length: 32,
      enum: ['search', 'latest', 'inline_search', 'inline_select', 'meme_post'],
    }).notNull(),
    query: varchar('query', { length: 255 }),
    page: varchar('page', { length: 128 }).notNull(),
    timestamp: int('timestamp').notNull(),
  },
  table => {
    return {
      userId: index('user_id').on(table.userId),
    }
  },
)
