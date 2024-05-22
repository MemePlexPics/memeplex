import { botPublisherChannels } from '../../db/schema'
import { TDbConnection } from '../types'

export const upsertPublisherChannel = async (
  db: TDbConnection,
  values: typeof botPublisherChannels.$inferInsert,
) => {
  await db
    .insert(botPublisherChannels)
    .values(values)
    .onDuplicateKeyUpdate({
      set: {
        userId: values.userId,
        username: values.username,
      },
    })
}
