import { botPublisherGroupKeywordUnsubscriptions } from '../../db/schema'
import { TDbConnection } from '../types'

export const insertPublisherGroupKeywordUnsubscription = async (
  db: TDbConnection,
  values: (typeof botPublisherGroupKeywordUnsubscriptions.$inferInsert)[],
) => {
  await db.insert(botPublisherGroupKeywordUnsubscriptions).values(values)
}
