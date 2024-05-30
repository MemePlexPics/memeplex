import type { selectBotTopicKeywordUnsubscriptions } from '../../../../../utils/mysql-queries'

export const getUnsubscriptionKeywordsByChannelId = (
  unsubscriptions: Awaited<ReturnType<typeof selectBotTopicKeywordUnsubscriptions>>,
) =>
  unsubscriptions.reduce<Record<string, Record<number, true>>>((obj, { channelId, keyword }) => {
    if (!keyword) {
      return obj
    }
    if (!obj[keyword]) {
      obj[keyword] = {}
    }
    obj[keyword][channelId] = true
    return obj
  }, {})
