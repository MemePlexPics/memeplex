import { botPublisherSubscriptions } from '../../db/schema'
import { and, eq } from 'drizzle-orm'
import { TDbConnection } from '../types'

export const deletePublisherSubscription = async (
  db: TDbConnection,
  channelId: number,
  keyword: string
) => {
  await db
    .delete(botPublisherSubscriptions)
    .where(
      and(
        eq(botPublisherSubscriptions.keyword, keyword),
        eq(botPublisherSubscriptions.channelId, channelId)
      )
    )
}
