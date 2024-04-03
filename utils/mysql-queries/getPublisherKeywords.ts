import { botPublisherKeywords } from '../../db/schema'
import { TDbConnection } from '../types'

export const getPublisherKeywords = (
  db: TDbConnection
) => {
  return db.select().from(botPublisherKeywords)
}
