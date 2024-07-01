import { mysqlTable, int, varchar, foreignKey, bigint, unique } from 'drizzle-orm/mysql-core'
import { botUsers } from '.'

export const botChannels = mysqlTable(
  'bot_channels',
  {
    id: int('id').autoincrement().primaryKey(),
    telegramId: bigint('telegram_id', { mode: 'number' }).notNull(),
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
      unique: unique('bot_channels__userId-telegram_id').on(table.telegramId, table.userId),
      userReference: foreignKey({
        columns: [table.userId],
        foreignColumns: [botUsers.id],
        name: 'bot_channels_user_id_fk',
      }),
    }
  },
)
