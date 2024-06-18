import type { TMemeEntity } from '../../types'

export type TPublisherDistributionQueueMsg = {
  userId: number
  memeId: string
  document: Pick<TMemeEntity, 'fileName' | 'channelName' | 'messageId'>
  keywords: string[]
  topics: string[]
  channelIds: number[]
}
