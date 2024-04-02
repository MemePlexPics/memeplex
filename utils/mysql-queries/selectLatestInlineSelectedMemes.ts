import { MySql2Database } from 'drizzle-orm/mysql2'
import { botInlineActions } from '../../db/schema'
import { eq } from 'drizzle-orm'

export const selectLatestInlineSelectedMemes = async (
  db: MySql2Database<Record<string, never>>,
  limit: number
) => {
  return await db
    .selectDistinct({ selectedId: botInlineActions.selectedId })
    .from(botInlineActions)
    .where(eq(botInlineActions.action, 'select'))
    .limit(limit)
}
