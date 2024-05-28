import type { TElasticMemeEntity } from '../../types'

export const getMemeResponseEntity = (id: string, source: TElasticMemeEntity) => {
  return {
    id,
    fileName: source.fileName,
    channel: source.channelName,
    messageId: source.messageId,
    text: {
      eng: source.eng,
    },
  }
}
