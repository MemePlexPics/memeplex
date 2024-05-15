import { TPublisherDistributionQueueMsg } from '.'

export type TPrePublisherDistributionQueue = Record<
number,
Omit<
TPublisherDistributionQueueMsg,
| 'userId'
| 'keywords'
| 'keywordGroups'
| 'groupKeywords'
| 'channelIdsByKeyword'
| 'channelIdsByKeywordGroup'
>
>
