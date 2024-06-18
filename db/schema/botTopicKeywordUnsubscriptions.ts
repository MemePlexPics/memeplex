import { mysqlTable, int, unique, foreignKey, bigint } from 'drizzle-orm/mysql-core'
import { botChannels, botKeywords } from '.'

export const botTopicKeywordUnsubscriptions = mysqlTable(
  'bot_topic_keyword_unsubscriptions',
  {
    id: int('id').autoincrement().primaryKey(),
    keywordId: int('keyword_id').notNull(),
    channelId: bigint('channel_id', { mode: 'number' }).notNull(),
  },
  table => ({
    unique: unique('unsubscription__keyword_id-channel_id').on(table.keywordId, table.channelId),
    keywordReference: foreignKey({
      columns: [table.keywordId],
      foreignColumns: [botKeywords.id],
      name: 'bot_topic_keyword_unsubscriptions_keyword_id_fk',
    }),
    channelReference: foreignKey({
      columns: [table.channelId],
      foreignColumns: [botChannels.id],
      name: 'bot_topic_keyword_unsubscriptions__channel_id_fk',
    }),
  }),
)
