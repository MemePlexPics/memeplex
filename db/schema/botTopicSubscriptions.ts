import { mysqlTable, int, unique, foreignKey, bigint } from 'drizzle-orm/mysql-core'
import { botChannels, botTopics } from '.'

export const botTopicSubscriptions = mysqlTable(
  'bot_topic_subscriptions',
  {
    id: int('id').autoincrement().primaryKey(),
    topicId: int('topic_id').notNull(),
    channelId: bigint('channel_id', { mode: 'number' }).notNull(),
  },
  table => ({
    unique: unique('topic_id-channel_id').on(table.topicId, table.channelId),
    keywordReference: foreignKey({
      columns: [table.topicId],
      foreignColumns: [botTopics.id],
      name: 'bot_topic_subscriptions__topic_id_fk',
    }),
    channelReference: foreignKey({
      columns: [table.channelId],
      foreignColumns: [botChannels.id],
      name: 'bot_topic_subscriptions__channel_id_fk',
    }),
  }),
)
