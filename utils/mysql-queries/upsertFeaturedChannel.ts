import { featuredChannels } from '../../db/schema'
import type { TDbConnection } from '../types'

export async function upsertFeaturedChannel(
  db: TDbConnection,
  values: typeof featuredChannels.$inferInsert,
) {
  const [result] = await db
    .insert(featuredChannels)
    .values(values)
    .onDuplicateKeyUpdate({
      set: {
        title: values.title,
        timestamp: values.timestamp,
        comment: values.comment,
      },
    })
  return result.affectedRows
}
