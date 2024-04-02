import { MySql2Database } from 'drizzle-orm/mysql2'
import { botPublisherChannels } from '../../db/schema'

export const insertPublisherChannel = async (
  db: MySql2Database<Record<string, never>>,
  values: typeof botPublisherChannels.$inferInsert
) => {
  await db
    .insert(botPublisherChannels)
    .values(values)
    .onDuplicateKeyUpdate({ set: { userId: values.userId } })
}
