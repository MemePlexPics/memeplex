import { TMemeEntity } from '.'

export type TPublisherDistributionQueueMsg = {
  userId: number
  memeId: string
  document: Pick<TMemeEntity, 'fileName'>
  keywords: string[]
  channelIds: number[]
}
