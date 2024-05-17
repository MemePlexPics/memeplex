import { foreignKey, int, mysqlTable, unique } from 'drizzle-orm/mysql-core'
import { botPublisherKeywordGroupNames, botPublisherKeywords } from '.'

export const botPublisherKeywordGroups = mysqlTable(
  'bot_publisher_keyword_groups',
  {
    id: int('id').autoincrement().primaryKey(),
    groupId: int('group_id').notNull(),
    keywordId: int('keyword_id').notNull(),
  },
  table => ({
    unique: unique('group_id-keyword_id').on(table.groupId, table.keywordId),
    groupIdReference: foreignKey({
      columns: [table.groupId],
      foreignColumns: [botPublisherKeywordGroupNames.id],
      name: 'bot_publisher_keyword_groups_group_id_fk',
    }),
    keywordIdReference: foreignKey({
      columns: [table.keywordId],
      foreignColumns: [botPublisherKeywords.id],
      name: 'bot_publisher_keyword_groups_keyword_id_fk',
    }),
  }),
)
