import { TMemeEntity } from "."

export type TPublisherDistributionQueueMsg = {
    userId: string
    document: TMemeEntity
    keywords: string[]
    channelIds: number[]
}
