import { mysqlTable, int, unique, foreignKey, bigint, varchar } from 'drizzle-orm/mysql-core'
import { botPublisherChannels, botPublisherKeywordGroups } from '.'

export const botPublisherGroupSubscriptions = mysqlTable(
  'bot_publisher_group_subscriptions',
  {
    id: int('id').autoincrement().primaryKey(),
    groupName: varchar('group_name', { length: 255 }).notNull(),
    channelId: bigint('channel_id', { mode: 'number' }).notNull(),
  },
  table => ({
    unique: unique('group_name-channel_id').on(table.groupName, table.channelId),
    keywordReference: foreignKey({
      columns: [table.groupName],
      foreignColumns: [botPublisherKeywordGroups.name],
      name: 'bot_publisher_group_subscriptions__group_name_fk',
    }),
    channelReference: foreignKey({
      columns: [table.channelId],
      foreignColumns: [botPublisherChannels.id],
      name: 'bot_publisher_group_subscriptions__channel_id_fk',
    }),
  }),
)
