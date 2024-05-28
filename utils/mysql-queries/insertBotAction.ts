import { botActions } from '../../db/schema'
import type { TDbConnection } from '../types'

export const insertBotAction = async (
  db: TDbConnection,
  values: Omit<typeof botActions.$inferInsert, 'timestamp'>,
) => {
  const timestamp = Math.floor(Date.now() / 1000)
  return await db.insert(botActions).values({
    ...values,
    timestamp,
  })
}
