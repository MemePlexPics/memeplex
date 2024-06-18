import { mysqlTable, int, foreignKey, bigint } from 'drizzle-orm/mysql-core'
import { botUsers } from '.'

export const botUserPremiums = mysqlTable(
  'bot_user_premiums',
  {
    userId: bigint('user_id', { mode: 'number' }).primaryKey(),
    untilTimestamp: int('until_timestamp').notNull(),
  },
  table => {
    return {
      userReference: foreignKey({
        columns: [table.userId],
        foreignColumns: [botUsers.id],
        name: 'bot_user_premiums__user_id_fk',
      }),
    }
  },
)
