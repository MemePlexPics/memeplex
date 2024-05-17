import { TMemeEntity } from '.'

export type TPublisherDistributionQueueMsg = {
  userId: number
  memeId: string
  document: Pick<TMemeEntity, 'fileName' | 'channelName' | 'messageId'>
  keywords: string[]
  keywordGroupIds: number[]
  groupKeywords: Record<string, number>
  channelIdsByKeyword: Record<string, number[]>
  channelIdsByKeywordGroup: Record<string, number[]>
  channelIds: number[]
}
