import type { TelegramClientWrapper } from '.'
import { getDbConnection } from '../../../utils'
import { upsertBotPremiumUser } from '../../../utils/mysql-queries'

export const grantPremium = async (tgClient: TelegramClientWrapper, userId: number = 1) => {
  await tgClient.executeCommand('/start')
  const db = await getDbConnection()
  await upsertBotPremiumUser(db, {
    userId,
    untilTimestamp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
  })
  await db.close()
}
