import { ECallback, EKeywordAction, EKeywordGroupAction } from '../constants'

export const callbackData = {
  premoderationPostButton: (channelId: number, memeId: string) =>
    `${ECallback.POST}|${channelId}|${memeId}` as const,
  premoderationKeywordButton: (action: EKeywordAction, channelId: number, keywordId: number) =>
    `${ECallback.KEY}|${action}|${channelId}|${keywordId}` as const,
  premoderationKeywordGroupButton: (
    action: EKeywordGroupAction,
    channelId: number,
    keywordGroupId: number,
  ) => `${ECallback.GROUP}|${action}|${channelId}|${keywordGroupId}` as const,
  premoderationGroupKeywordsButton: (
    action: EKeywordAction,
    channelId: number,
    keywordId: number,
    keywordGroupId: number,
  ) => `${ECallback.GROUP_KEYWORD}|${action}|${channelId}|${keywordId}|${keywordGroupId}` as const,
}
