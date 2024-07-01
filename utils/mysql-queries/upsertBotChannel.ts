import { botChannels } from '../../db/schema'
import type { TDbConnection } from '../types'

export const upsertBotChannel = (
  db: TDbConnection,
  values: typeof botChannels.$inferInsert,
) => {
  return db
    .insert(botChannels)
    .values(values)
    .onDuplicateKeyUpdate({
      set: {
        username: values.username,
      },
    })
}
