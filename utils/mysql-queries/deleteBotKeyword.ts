import { botKeywords } from '../../db/schema'
import { eq } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const deleteBotKeyword = async (db: TDbConnection, keyword: string) => {
  await db
    .delete(botKeywords)
    .where(eq(botKeywords.keyword, keyword))
    .catch(e => {
      if (e.code !== 'ER_ROW_IS_REFERENCED_2') throw e
    })
}
