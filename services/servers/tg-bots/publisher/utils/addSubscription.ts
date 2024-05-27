import type { botPublisherKeywords } from '../../../../../db/schema'
import {
  deletePublisherGroupKeywordUnsubscription,
  insertPublisherKeywords,
  insertPublisherSubscription,
  selectPublisherKeywordsByKeywords,
} from '../../../../../utils/mysql-queries'
import type { TDbConnection } from '../../../../../utils/types'

export const addSubscription = async (
  db: TDbConnection,
  channelId: number,
  keywordValues: (typeof botPublisherKeywords.$inferInsert)[],
) => {
  await insertPublisherKeywords(db, keywordValues)
  const keywords = await selectPublisherKeywordsByKeywords(
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

  await insertPublisherSubscription(db, subscriptions)
  await deletePublisherGroupKeywordUnsubscription(db, channelId, keywordIds)
}
