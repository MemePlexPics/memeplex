import { botUsers } from '../../db/schema'
import type { TDbConnection } from '../types'

export const upsertBotUser = async (
  db: TDbConnection,
  values: Omit<typeof botUsers.$inferInsert, 'timestamp'>,
) => {
  const timestamp = Math.floor(Date.now() / 1000)
  return await db
    .insert(botUsers)
    .values({
      ...values,
      timestamp,
    })
    .onDuplicateKeyUpdate({ set: { user: values.user } })
}
