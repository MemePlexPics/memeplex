import {
  mysqlTable,
  int,
  unique,
  foreignKey,
  bigint,
  varchar
} from 'drizzle-orm/mysql-core'
import { botPublisherChannels, botPublisherKeywords } from '.'

export const botPublisherSubscriptions = mysqlTable(
  'bot_publisher_subscriptions',
  {
    id: int('id').autoincrement().primaryKey(),
    keyword: varchar('keyword', { length: 255 }).notNull(),
    channelId: bigint('channel_id', { mode: 'number' }).notNull()
  },
  (table) => ({
    unique: unique('keyword_id-channel_id').on(table.keyword, table.channelId),
    keywordReference: foreignKey({
      columns: [table.keyword],
      foreignColumns: [botPublisherKeywords.keyword],
      name: 'bot_publisher_subscriptions_keyword_fk'
    }),
    channelReference: foreignKey({
      columns: [table.channelId],
      foreignColumns: [botPublisherChannels.id],
      name: 'bot_publisher_subscriptions__channel_id_fk'
    })
  })
)
