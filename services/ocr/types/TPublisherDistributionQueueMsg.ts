import { TMemeEntity } from '.'

export type TPublisherDistributionQueueMsg = {
  userId: number
  memeId: string
  document: TMemeEntity
  keywords: string[]
  channelIds: number[]
}
