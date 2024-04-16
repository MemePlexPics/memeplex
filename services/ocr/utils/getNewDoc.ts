import { TAmqpImageFileChannelMessage } from '../../types'
import { TMemeEntity } from '../types'

export const getNewDoc = (
  payload: TAmqpImageFileChannelMessage,
  texts: Record<'eng', string>,
): TMemeEntity => {
  const eng = payload.sourceText ? `${texts.eng}\n${payload.sourceText}`.slice(0, 1024) : texts.eng
  const doc = {
    timestamp: Math.floor(Date.now() / 1000),
    fileName: payload.fileName,
    channelName: payload.channelName,
    messageId: payload.messageId,
    date: payload.date,
    eng,
  }

  return doc
}
