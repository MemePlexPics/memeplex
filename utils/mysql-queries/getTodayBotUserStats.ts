import { count, countDistinct, gte, sql } from 'drizzle-orm'
import { union } from 'drizzle-orm/mysql-core'
import { botActions, botInlineActions } from '../../db/schema'
import type { TDbConnection } from '../types'

export const getTodayBotUserStats = async (db: TDbConnection) => {
  const todayStart = sql<number>`UNIX_TIMESTAMP(CURDATE())`

  const [inlineUsers] = await db
    .select({ value: countDistinct(botInlineActions.userId) })
    .from(botInlineActions)
    .where(gte(botInlineActions.timestamp, todayStart))
  const [inBotUsers] = await db
    .select({ value: countDistinct(botActions.userId) })
    .from(botActions)
    .where(gte(botActions.timestamp, todayStart))

  const distinctTodayUserIds = union(
    db
      .selectDistinct({ userId: botInlineActions.userId })
      .from(botInlineActions)
      .where(gte(botInlineActions.timestamp, todayStart)),
    db
      .selectDistinct({ userId: botActions.userId })
      .from(botActions)
      .where(gte(botActions.timestamp, todayStart)),
  ).as('distinct_today_user_ids')
  const [totalUsers] = await db.select({ value: count() }).from(distinctTodayUserIds)

  return {
    inline: inlineUsers.value,
    inBot: inBotUsers.value,
    total: totalUsers.value,
  }
}
