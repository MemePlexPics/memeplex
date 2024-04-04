import { mysqlTable, int, varchar, foreignKey, bigint } from 'drizzle-orm/mysql-core'
import { botPublisherUsers } from '.'

export const botPublisherChannels = mysqlTable(
  'bot_publisher_channels',
  {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    userId: int('user_id').notNull(),
    username: varchar('username', { length: 255 }).notNull(),
    subscribers: int('subscribers').notNull(),
    type: varchar('type', { length: 32 }),
    timestamp: int('timestamp').notNull(),
  },
  table => {
    return {
      userReference: foreignKey({
        columns: [table.userId],
        foreignColumns: [botPublisherUsers.id],
        name: 'bot_publisher_channels_user_id_fk',
      }),
    }
  },
)
