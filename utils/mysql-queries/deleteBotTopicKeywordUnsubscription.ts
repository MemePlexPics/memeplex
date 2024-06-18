import { and, eq, inArray } from 'drizzle-orm'
import { botTopicKeywordUnsubscriptions } from '../../db/schema'
import type { TDbConnection } from '../types'

export const deleteBotTopicKeywordUnsubscription = async (
  db: TDbConnection,
  channelId: number,
  keywordIds: number[],
) => {
  await db
    .delete(botTopicKeywordUnsubscriptions)
    .where(
      and(
        eq(botTopicKeywordUnsubscriptions.channelId, channelId),
        inArray(botTopicKeywordUnsubscriptions.keywordId, keywordIds),
      ),
    )
}
