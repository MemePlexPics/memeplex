import { botSubscriptions } from '../../db/schema'
import { and, eq, inArray } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const deleteBotSubscription = async (
  db: TDbConnection,
  channelId: number,
  keywordIds: number[],
) => {
  await db
    .delete(botSubscriptions)
    .where(
      and(
        eq(botSubscriptions.channelId, channelId),
        inArray(botSubscriptions.keywordId, keywordIds),
      ),
    )
}
