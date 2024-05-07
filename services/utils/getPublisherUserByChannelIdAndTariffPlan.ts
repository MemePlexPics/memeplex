import { initPublisherDistributionQueueMsg } from '../ocr/utils'
import { getPublisherUserByChannelId, getPublisherUserTariffPlan } from '.'
import { TDbConnection } from '../../utils/types'
import { TMemeEntity, TPrePublisherDistributionQueue } from '../types'

export const getPublisherUserByChannelIdAndTariffPlan = async (
  db: TDbConnection,
  queue: TPrePublisherDistributionQueue,
  tariffPlanByUsers: Record<number, 'free' | 'premium'>,
  channelId: number,
  memeId: string,
  document: TMemeEntity,
) => {
  const userId = await getPublisherUserByChannelId(db, channelId)
  initPublisherDistributionQueueMsg(queue, userId, memeId, document)
  if (!tariffPlanByUsers[userId]) {
    tariffPlanByUsers[userId] = await getPublisherUserTariffPlan(db, userId)
  }
  return userId
}
