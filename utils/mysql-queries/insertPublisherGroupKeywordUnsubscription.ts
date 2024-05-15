import { botPublisherGroupKeywordUnsubscriptions } from '../../db/schema'
import { TDbConnection } from '../types'

export const insertPublisherGroupKeywordUnsubscription = async (
  db: TDbConnection,
  channelId: number,
  keyword: string,
) => {
  await db.insert(botPublisherGroupKeywordUnsubscriptions).values([
    {
      channelId,
      keyword,
    },
  ])
}
