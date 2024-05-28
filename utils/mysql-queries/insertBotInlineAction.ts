import { botInlineActions } from '../../db/schema'
import type { TDbConnection } from '../types'

export const insertBotInlineAction = async (
  db: TDbConnection,
  values: Omit<typeof botInlineActions.$inferInsert, 'timestamp'>,
) => {
  const timestamp = Math.floor(Date.now() / 1000)
  return await db.insert(botInlineActions).values({
    ...values,
    timestamp,
  })
}
