import { mysqlTable, int, foreignKey, bigint } from 'drizzle-orm/mysql-core'
import { botPublisherUsers } from '.'

export const botPublisherUserPremiums = mysqlTable(
  'bot_publisher_user_premiums',
  {
    userId: bigint('user_id', { mode: 'number' }).primaryKey(),
    untilTimestamp: int('until_timestamp').notNull(),
  },
  table => {
    return {
      userReference: foreignKey({
        columns: [table.userId],
        foreignColumns: [botPublisherUsers.id],
        name: 'bot_publisher_user_premiums__user_id_fk',
      }),
    }
  },
)
