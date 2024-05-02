import { mysqlTable, varchar, foreignKey, bigint, int } from 'drizzle-orm/mysql-core'
import { botPublisherUsers } from '.'

export const botPublisherInvoices = mysqlTable(
  'bot_publisher_invoices',
  {
    id: int('id').primaryKey(),
    hash: varchar('hash', { length: 255 }).notNull(),
    userId: bigint('user_id', { mode: 'number' }).notNull(),
    status: varchar('status', { length: 16, enum: ['active', 'paid', 'expired'] }).notNull(),
    createdAt: varchar('created_at', { length: 255 }).notNull(),
  },
  table => {
    return {
      userReference: foreignKey({
        columns: [table.userId],
        foreignColumns: [botPublisherUsers.id],
        name: 'bot_publisher_invoices_user_id_fk',
      }),
    }
  },
)
