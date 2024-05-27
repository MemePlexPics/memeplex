import type { TMemeEntity, TPrePublisherDistributionQueue } from '../../types'

export const initPublisherDistributionQueueMsg = (
  queue: TPrePublisherDistributionQueue,
  userId: number,
  memeId: string,
  document: TMemeEntity,
) => {
  if (!queue[userId]) {
    queue[userId] = {
      memeId,
      document: {
        fileName: document.fileName,
        channelName: document.channelName,
        messageId: document.messageId,
      },
      channelIds: [],
    }
  }
}
