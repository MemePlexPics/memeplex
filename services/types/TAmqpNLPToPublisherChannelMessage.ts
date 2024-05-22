import { TMemeEntity } from '.'

export type TAmqpNLPToPublisherChannelMessage = {
  memeId: string
  memeData: TMemeEntity
  matchedKeywords: string[]
}
