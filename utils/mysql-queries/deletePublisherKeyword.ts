import { botPublisherKeywords } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { TDbConnection } from '../types'

export const deletePublisherKeyword = async (db: TDbConnection, keyword: string) => {
  await db
    .delete(botPublisherKeywords)
    .where(eq(botPublisherKeywords.keyword, keyword))
    .catch(e => console.error(e)) // TODO: handle the exact error (exist references)
}
