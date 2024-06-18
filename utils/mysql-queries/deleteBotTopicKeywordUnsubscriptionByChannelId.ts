import { eq } from 'drizzle-orm'
import { botTopicKeywordUnsubscriptions } from '../../db/schema'
import type { TDbConnection } from '../types'

export const deleteBotTopicKeywordUnsubscriptionByChannelId = async (
  db: TDbConnection,
  channelId: number,
) => {
  await db
    .delete(botTopicKeywordUnsubscriptions)
    .where(eq(botTopicKeywordUnsubscriptions.channelId, channelId))
}
