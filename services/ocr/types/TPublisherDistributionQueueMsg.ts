import { TMemeEntity } from "."

export type TPublisherDistributionQueueMsg = {
    userId: string
    memeId: string
    document: TMemeEntity
    keywords: string[]
    channelIds: number[]
}