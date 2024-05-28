import type { botKeywords } from '../../../../../db/schema'
import {
  deleteBotTopicKeywordUnsubscription,
  insertBotKeywords,
  insertBotSubscription,
  selectBotKeywordsByKeywords,
} from '../../../../../utils/mysql-queries'
import type { TDbConnection } from '../../../../../utils/types'

export const addSubscription = async (
  db: TDbConnection,
  channelId: number,
  keywordValues: (typeof botKeywords.$inferInsert)[],
) => {
  await insertBotKeywords(db, keywordValues)
  const keywords = await selectBotKeywordsByKeywords(
    db,
    keywordValues.map(value => value.keyword),
  )

  const keywordIds: number[] = []
  const subscriptions = keywords.map(({ id }) => {
    keywordIds.push(id)
    return {
      keywordId: id,
      channelId,
    }
  })

  await insertBotSubscription(db, subscriptions)
  await deleteBotTopicKeywordUnsubscription(db, channelId, keywordIds)
}
