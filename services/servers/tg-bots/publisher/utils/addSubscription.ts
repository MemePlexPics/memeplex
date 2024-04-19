import { botPublisherKeywords } from '../../../../../db/schema'
import {
  insertPublisherKeywords,
  insertPublisherSubscription,
} from '../../../../../utils/mysql-queries'
import { TDbConnection } from '../../../../../utils/types'

export const addSubscription = async (
  db: TDbConnection,
  channelId: number,
  keywordValues: (typeof botPublisherKeywords.$inferInsert)[],
) => {
  await insertPublisherKeywords(db, keywordValues)

  const subscriptions = keywordValues.map(({ keyword }) => ({
    keyword,
    channelId,
  }))

  await insertPublisherSubscription(db, subscriptions)
}
