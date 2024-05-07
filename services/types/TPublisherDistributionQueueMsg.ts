import { TMemeEntity } from '.'

export type TPublisherDistributionQueueMsg = {
  userId: number
  memeId: string
  document: Pick<TMemeEntity, 'fileName' | 'channelName' | 'messageId'>
  keywords: string[]
  keywordGroups: string[]
  channelIds: number[]
}
