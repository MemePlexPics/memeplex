import { mysqlTable, int, unique, foreignKey, bigint } from 'drizzle-orm/mysql-core'
import { botPublisherChannels, botPublisherKeywordGroups } from '.'

export const botPublisherGroupSubscriptions = mysqlTable(
  'bot_publisher_group_subscriptions',
  {
    id: int('id').autoincrement().primaryKey(),
    groupId: int('group_id').notNull(),
    channelId: bigint('channel_id', { mode: 'number' }).notNull(),
  },
  table => ({
    unique: unique('group_id-channel_id').on(table.groupId, table.channelId),
    keywordReference: foreignKey({
      columns: [table.groupId],
      foreignColumns: [botPublisherKeywordGroups.id],
      name: 'bot_publisher_group_subscriptions__group_id_fk',
    }),
    channelReference: foreignKey({
      columns: [table.channelId],
      foreignColumns: [botPublisherChannels.id],
      name: 'bot_publisher_group_subscriptions__channel_id_fk',
    }),
  }),
)
