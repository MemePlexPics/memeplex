import { botInlineActions } from '../../db/schema'
import { desc, eq } from 'drizzle-orm'
import { TDbConnection } from '../types'

export const selectLatestInlineSelectedMemes = async (
  db: TDbConnection,
  limit: number
) => {
  return await db
    .selectDistinct({ selectedId: botInlineActions.selectedId })
    .from(botInlineActions)
    .where(eq(botInlineActions.action, 'select'))
    .orderBy(desc(botInlineActions.timestamp))
    .limit(limit)
}
