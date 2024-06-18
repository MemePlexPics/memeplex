import { botTopicKeywordUnsubscriptions } from '../../db/schema'
import type { TDbConnection } from '../types'

export const insertBotTopicKeywordUnsubscription = async (
  db: TDbConnection,
  values: (typeof botTopicKeywordUnsubscriptions.$inferInsert)[],
) => {
  await db.insert(botTopicKeywordUnsubscriptions).values(values)
}
