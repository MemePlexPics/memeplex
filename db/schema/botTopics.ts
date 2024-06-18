import { foreignKey, int, mysqlTable, unique } from 'drizzle-orm/mysql-core'
import { botTopicNames, botKeywords } from '.'

export const botTopics = mysqlTable(
  'bot_topics',
  {
    // TODO: reconsider if we need these ids
    id: int('id').autoincrement().primaryKey(),
    nameId: int('name_id').notNull(),
    keywordId: int('keyword_id').notNull(),
  },
  table => ({
    unique: unique('name_id-keyword_id').on(table.nameId, table.keywordId),
    topicIdReference: foreignKey({
      columns: [table.nameId],
      foreignColumns: [botTopicNames.id],
      name: 'bot_topics_name_id_fk',
    }),
    keywordIdReference: foreignKey({
      columns: [table.keywordId],
      foreignColumns: [botKeywords.id],
      name: 'bot_topics_keyword_id_fk',
    }),
  }),
)
