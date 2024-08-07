import { selectBotPremiumUser } from '../../utils/mysql-queries'
import type { TDbConnection } from '../../utils/types'

export const getPublisherUserTariffPlan = async (db: TDbConnection, userId: number) => {
  const isPremium = await selectBotPremiumUser(db, userId)
  return isPremium.length !== 0 ? 'premium' : 'free'
}
