import { eq } from 'drizzle-orm'
import { botPublisherKeywordGroups } from '../../db/schema'
import { TDbConnection } from '../types'

export const selectPublisherKeywordGroupByName = async (db: TDbConnection, name: string) => {
  return await db
    .select()
    .from(botPublisherKeywordGroups)
    .where(eq(botPublisherKeywordGroups.name, name))
}
