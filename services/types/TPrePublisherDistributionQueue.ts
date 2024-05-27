import type { TPublisherDistributionQueueMsg } from '.'

export type TPrePublisherDistributionQueue = Record<
number,
Pick<TPublisherDistributionQueueMsg, 'memeId' | 'document' | 'channelIds'>
>
