import {
  enterToState,
  handleTopicKeywordAction,
  handleKeywordAction,
  handleTopicAction,
  handleMemePost,
} from '.'
import type { TSplitCallback, TState, TTelegrafContext } from '../types'
import type { EKeywordAction, callbackData } from '../constants'
import { ECallback, ELatestAction } from '../constants'
import { isDataQuery } from '../typeguards'
import { buyPremiumState } from '../states'
import { onBotCommandGetLatest, onBotRecieveText } from '../handlers'
import type { CallbackQuery, Update } from 'telegraf/typings/core/types/typegram'

export const handleCallbackQuery = async (
  ctx: TTelegrafContext<Update.CallbackQueryUpdate<CallbackQuery>>,
  handler?: TState['onCallback'],
) => {
  if (!isDataQuery(ctx.update.callback_query)) return
  const callbackQuery = ctx.update.callback_query.data
  const [firstPartCb, ...restCb] = callbackQuery.split('|')
  const state = firstPartCb as ECallback
  if (state === ECallback.IGNORE) {
    return
  }
  if (state === ECallback.POST) {
    const restCbData = restCb as TSplitCallback<
    ReturnType<typeof callbackData.premoderation.postButton>
    >
    const [channelId, memeId] = restCbData
    await handleMemePost(ctx, Number(channelId), memeId)
    return
  }
  if (state === ECallback.KEY) {
    const restCbData = restCb as TSplitCallback<
    ReturnType<typeof callbackData.premoderation.keywordButton>
    >
    const [action, channelId, keywordId] = restCbData
    await handleKeywordAction(ctx, action as EKeywordAction, Number(channelId), Number(keywordId))
    return
  }
  if (state === ECallback.GROUP) {
    const restCbData = restCb as TSplitCallback<
    ReturnType<typeof callbackData.premoderation.topicButton>
    >
    const [action, channelId, topicId] = restCbData
    await handleTopicAction(ctx, action as EKeywordAction, Number(channelId), Number(topicId))
    return
  }
  if (state === ECallback.TOPIC_KEYWORD) {
    const restCbData = restCb as TSplitCallback<
    ReturnType<typeof callbackData.premoderation.topicKeywordsButton>
    >
    const [action, channelId, keywordId, topicId] = restCbData
    await handleTopicKeywordAction(
      ctx,
      action as EKeywordAction,
      Number(channelId),
      Number(keywordId),
      Number(topicId),
    )
    return
  }
  if (state === ECallback.PAY) {
    await enterToState(ctx, buyPremiumState)
    return
  }
  if (state === ECallback.SEARCH_NEXT_PAGE) {
    if (!ctx.session.search.query) {
      throw new Error(
        `Requested more memes without query in a session: ${JSON.stringify(ctx.session.search, null, 2)}`,
      )
    }
    await onBotRecieveText(ctx, ctx.session.search.query)
    return
  }
  if (state === ECallback.LATEST) {
    const restCbData = restCb as TSplitCallback<
    ReturnType<typeof callbackData.latest.loadAnotherPage>
    >
    const [action] = restCbData
    if (action === ELatestAction.OLDER) {
      await onBotCommandGetLatest(ctx, false)
    } else {
      await onBotCommandGetLatest(ctx, true)
    }
    return
  }
  state satisfies never
  if (handler) await handler(ctx, callbackQuery)
}
