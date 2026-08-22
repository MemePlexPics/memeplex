import { telegrafSessions } from '../../db/schema'
import { eq } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const updateTelegrafSessionPremiumUntil = async (
  db: TDbConnection,
  userId: number,
  untilTimestamp: number | undefined,
) => {
  const key = `${userId}:${userId}` as const
  const [row] = await db.select().from(telegrafSessions).where(eq(telegrafSessions.key, key))
  if (!row?.session) {
    return
  }
  await db
    .update(telegrafSessions)
    .set({
      session: {
        ...row.session,
        premiumUntil: untilTimestamp,
      },
    })
    .where(eq(telegrafSessions.key, key))
}
