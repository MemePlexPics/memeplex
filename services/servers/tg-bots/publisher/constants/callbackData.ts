import type { EKeywordAction, ETopicAction, ELatestAction } from '../constants'
import { ECallback } from '../constants'

export const callbackData = {
  keywordSetting: {
    keyword: (action: EKeywordAction, keywordId: number) =>
      `${ECallback.KEY}|${action}|${keywordId}` as const,
    topicKeyword: (action: EKeywordAction, keywordId: number, topicId: number) =>
      `${ECallback.GROUP_KEYWORD}|${action}|${keywordId}|${topicId}` as const,
  },
  premoderation: {
    postButton: (channelId: number, memeId: string) =>
      `${ECallback.POST}|${channelId}|${memeId}` as const,
    keywordButton: (action: EKeywordAction, channelId: number, keywordId: number) =>
      `${ECallback.KEY}|${action}|${channelId}|${keywordId}` as const,
    topicButton: (action: ETopicAction, channelId: number, topicId: number) =>
      `${ECallback.GROUP}|${action}|${channelId}|${topicId}` as const,
    topicKeywordsButton: (
      action: EKeywordAction,
      channelId: number,
      keywordId: number,
      topicId: number,
    ) => `${ECallback.GROUP_KEYWORD}|${action}|${channelId}|${keywordId}|${topicId}` as const,
  },
  latest: {
    loadAnotherPage: (direction: ELatestAction) => `${ECallback.LATEST}|${direction}` as const,
  },
}
