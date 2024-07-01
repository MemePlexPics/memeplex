import { mysqlTable, int, foreignKey, unique } from 'drizzle-orm/mysql-core'
import { botChannels, botKeywords } from '.'

export const botSubscriptions = mysqlTable(
  'bot_subscriptions',
  {
    id: int('id').autoincrement().primaryKey(),
    keywordId: int('keyword_id').notNull(),
    channelId: int('channel_id').notNull(),
  },
  table => ({
    unique: unique('subscription_keyword_id-channel_id').on(table.keywordId, table.channelId),
    keywordReference: foreignKey({
      columns: [table.keywordId],
      foreignColumns: [botKeywords.id],
      name: 'bot_subscriptions_keyword_id_fk',
    }),
    channelReference: foreignKey({
      columns: [table.channelId],
      foreignColumns: [botChannels.id],
      name: 'bot_subscriptions__channel_id_fk',
    }),
  }),
)
