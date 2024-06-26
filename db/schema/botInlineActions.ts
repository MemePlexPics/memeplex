import { mysqlTable, index, int, varchar } from 'drizzle-orm/mysql-core'
import { botInlineUsers } from '.'

export const botInlineActions = mysqlTable(
  'bot_inline_actions',
  {
    id: int('id').autoincrement().primaryKey(),
    userId: int('user_id')
      .notNull()
      .references(() => botInlineUsers.id, {
        onDelete: 'restrict',
        onUpdate: 'restrict',
      }),
    action: varchar('action', { length: 32 }).notNull(),
    query: varchar('query', { length: 255 }),
    selectedId: varchar('selected_id', { length: 32 }),
    page: varchar('page', { length: 128 }),
    chatType: varchar('chat_type', { length: 128 }),
    timestamp: int('timestamp').notNull(),
  },
  table => {
    return {
      userId: index('user_id').on(table.userId),
    }
  },
)
