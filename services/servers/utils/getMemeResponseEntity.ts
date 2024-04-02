import { TElasticMemeEntity } from '../../types'

export const getMemeResponseEntity = (
  id: string,
  source: TElasticMemeEntity
) => {
  return {
    id,
    fileName: source.fileName,
    channel: source.channelName,
    message: source.messageId,
    text: {
      eng: source.eng
    }
  }
}
