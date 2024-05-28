import { botInlineUsers } from '../../db/schema'
import type { TDbConnection } from '../types'

export const upsertBotInlineUser = async (
  db: TDbConnection,
  values: Omit<typeof botInlineUsers.$inferInsert, 'timestamp'>,
) => {
  const timestamp = Math.floor(Date.now() / 1000)
  return await db
    .insert(botInlineUsers)
    .values({
      ...values,
      timestamp,
    })
    .onDuplicateKeyUpdate({ set: { user: values.user } })
}
