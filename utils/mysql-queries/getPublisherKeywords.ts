import { botKeywords } from '../../db/schema'
import type { TDbConnection } from '../types'

export const getPublisherKeywords = (db: TDbConnection) => {
  return db.select().from(botKeywords)
}
