import type { TMemeEntity } from '.'

export type TPublisherDistributionQueueMsg = {
  userId: number
  memeId: string
  document: Pick<TMemeEntity, 'fileName' | 'channelName' | 'messageId'>
  keywords: string[]
  topicIds: number[]
  topicKeywords: Record<string, number>
  channelIdsByKeyword: Record<string, number[]>
  channelIdsByTopic: Record<string, number[]>
  channelIds: number[]
}
