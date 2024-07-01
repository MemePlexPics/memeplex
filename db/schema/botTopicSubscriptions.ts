import { mysqlTable, int, unique, foreignKey } from 'drizzle-orm/mysql-core'
import { botChannels, botTopicNames } from '.'

export const botTopicSubscriptions = mysqlTable(
  'bot_topic_subscriptions',
  {
    id: int('id').autoincrement().primaryKey(),
    topicId: int('topic_id').notNull(),
    channelId: int('channel_id').notNull(),
  },
  table => ({
    unique: unique('topic_id-channel_id').on(table.topicId, table.channelId),
    topicReference: foreignKey({
      columns: [table.topicId],
      foreignColumns: [botTopicNames.id],
      name: 'bot_topic_subscriptions__topic_id_fk',
    }),
    channelReference: foreignKey({
      columns: [table.channelId],
      foreignColumns: [botChannels.id],
      name: 'bot_topic_subscriptions__channel_id_fk',
    }),
  }),
)
