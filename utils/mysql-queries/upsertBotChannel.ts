import { botChannels } from '../../db/schema'
import type { TDbConnection } from '../types'

export const upsertBotChannel = async (
  db: TDbConnection,
  values: typeof botChannels.$inferInsert,
) => {
  await db
    .insert(botChannels)
    .values(values)
    .onDuplicateKeyUpdate({
      set: {
        userId: values.userId,
        username: values.username,
      },
    })
}
