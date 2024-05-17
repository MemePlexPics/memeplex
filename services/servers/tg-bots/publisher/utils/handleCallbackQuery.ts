import { Client } from '@elastic/elasticsearch'
import {
  handleGroupKeywordAction,
  handleKeywordAction,
  handleKeywordGroupAction,
  handleMemePost,
} from '.'
import { TState, TTelegrafContext } from '../types'
import { ECallback, EKeywordAction, callbackData } from '../constants'
import { isCallbackQueryUpdate, isDataQuery } from '../typeguards'
import { SplitString } from '../../../../../types'

export const handleCallbackQuery = async (
  ctx: TTelegrafContext,
  elastic: Client,
  handler?: TState['onCallback'],
) => {
  if (!isCallbackQueryUpdate(ctx.update) || !isDataQuery(ctx.update.callback_query)) return
  const callbackQuery = ctx.update.callback_query.data
  const [state, ...restCb] = callbackQuery.split('|')
  if (state === ECallback.IGNORE) {
    return
  }
  if (state === ECallback.POST) {
    const restCbData = restCb as SplitString<
    ReturnType<typeof callbackData.premoderationPostButton>,
    '|'
    > extends [infer _GFirst, ...infer GRest]
      ? GRest
      : never
    const [channelId, memeId] = restCbData
    await handleMemePost(elastic, ctx, Number(channelId), memeId)
    return
  }
  if (state === ECallback.KEY) {
    const restCbData = restCb as SplitString<
    ReturnType<typeof callbackData.premoderationKeywordButton>,
    '|'
    > extends [infer _GFirst, ...infer GRest]
      ? GRest
      : never
    const [action, channelId, keywordId] = restCbData
    await handleKeywordAction(ctx, action as EKeywordAction, Number(channelId), Number(keywordId))
    return
  }
  if (state === ECallback.GROUP) {
    const restCbData = restCb as SplitString<
    ReturnType<typeof callbackData.premoderationKeywordGroupButton>,
    '|'
    > extends [infer _GFirst, ...infer GRest]
      ? GRest
      : never
    const [action, channelId, keywordGroupId] = restCbData
    await handleKeywordGroupAction(
      ctx,
      action as EKeywordAction,
      Number(channelId),
      Number(keywordGroupId),
    )
    return
  }
  if (state === ECallback.GROUP_KEYWORD) {
    const restCbData = restCb as SplitString<
    ReturnType<typeof callbackData.premoderationGroupKeywordsButton>,
    '|'
    > extends [infer _GFirst, ...infer GRest]
      ? GRest
      : never
    const [action, channelId, keywordId, keywordGroupId] = restCbData
    await handleGroupKeywordAction(
      ctx,
      action as EKeywordAction,
      Number(channelId),
      Number(keywordId),
      Number(keywordGroupId),
    )
    return
  }
  if (handler) await handler(ctx, callbackQuery)
}
