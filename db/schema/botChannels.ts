import { mysqlTable, int, varchar, foreignKey, bigint } from 'drizzle-orm/mysql-core'
import { botUsers } from '.'

export const botChannels = mysqlTable(
  'bot_channels',
  {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    userId: bigint('user_id', { mode: 'number' }).notNull(),
    username: varchar('username', { length: 255 }).notNull(),
    subscribers: int('subscribers').notNull(),
    type: varchar('type', {
      length: 32,
      enum: ['channel', 'group', 'supergroup', 'private'],
    }).notNull(),
    timestamp: int('timestamp').notNull(),
  },
  table => {
    return {
      userReference: foreignKey({
        columns: [table.userId],
        foreignColumns: [botUsers.id],
        name: 'bot_channels_user_id_fk',
      }),
    }
  },
)
