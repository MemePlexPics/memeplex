import { initPublisherDistributionQueueMsg } from '../ocr/utils'
import { getPublisherUserTariffPlan } from '.'
import { TDbConnection } from '../../utils/types'
import { TMemeEntity, TPrePublisherDistributionQueue } from '../types'
import { selectPublisherChannelById } from '../../utils/mysql-queries'

export const getPublisherUserByChannelIdAndTariffPlan = async (
  db: TDbConnection,
  queue: TPrePublisherDistributionQueue,
  tariffPlanByUsers: Record<number, 'free' | 'premium'>,
  channelId: number,
  memeId: string,
  document: TMemeEntity,
) => {
  // TODO: why getPublisherUserByChannelId()?
  // const userId = await getPublisherUserByChannelId(db, channelId)
  const [channel] = await selectPublisherChannelById(db, channelId)
  initPublisherDistributionQueueMsg(queue, channel.userId, memeId, document)
  if (!tariffPlanByUsers[channel.userId]) {
    tariffPlanByUsers[channel.userId] = await getPublisherUserTariffPlan(db, channel.userId)
  }
  return channel.userId
}
