import { ECallback, EKeywordAction } from '../constants'

export const callbackData = {
  premoderationPostButton: (channelId: number, memeId: string) =>
    `${ECallback.POST}|${channelId}|${memeId}` as const,
  premoderationKeywordButton: (action: EKeywordAction, channelId: number, keyword: string) =>
    `${ECallback.KEY}|${action}|${channelId}|${keyword}` as const,
  premoderationKeywordGroupButton: (
    action: EKeywordAction,
    channelId: number,
    keywordGroup: string,
  ) => `${ECallback.GROUP}|${action}|${channelId}|${keywordGroup}` as const,
  premoderationGroupKeywordsButton: (
    action: EKeywordAction,
    channelId: number,
    keyword: string,
    keywordGroup: string,
  ) => `${ECallback.GROUP_KEYWORD}|${action}|${channelId}|${keyword}|${keywordGroup}` as const,
}
