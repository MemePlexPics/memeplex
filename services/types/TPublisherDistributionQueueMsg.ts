import { TMemeEntity } from '.'

export type TPublisherDistributionQueueMsg = {
  userId: number
  memeId: string
  document: Pick<TMemeEntity, 'fileName' | 'channelName' | 'messageId'>
  keywords: string[]
  keywordGroups: string[]
  groupKeywords: Record<string, string>
  channelIdsByKeyword: Record<string, number[]>
  channelIdsByKeywordGroup: Record<string, number[]>
  channelIds: number[]
}
