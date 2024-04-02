import { MySql2Database } from 'drizzle-orm/mysql2'
import { botPublisherKeywords } from '../../db/schema'
import { eq } from 'drizzle-orm'

export const deletePublisherKeyword = async (
  db: MySql2Database<Record<string, never>>,
  keyword: string
) => {
  await db
    .delete(botPublisherKeywords)
    .where(eq(botPublisherKeywords.keyword, keyword))
    .catch((e) => console.error(e)) // TODO: handle the exact error (exist references)
}
