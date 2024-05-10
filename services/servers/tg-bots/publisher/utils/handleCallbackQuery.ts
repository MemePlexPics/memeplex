import { Client } from '@elastic/elasticsearch'
import {
  handleInvoiceCreation,
  handleKeywordAction,
  handleKeywordGroupAction,
  handleMemePost,
} from '.'
import { TState, TTelegrafContext } from '../types'
import { ECallback, EKeywordAction } from '../constants'
import { isCallbackQueryUpdate, isDataQuery } from '../typeguards'

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
  if (state === ECallback.POST && typeof restCb[1] === 'string') {
    await handleMemePost(elastic, ctx, Number(restCb[0]), restCb[1])
    return
  }
  if (state === ECallback.KEY && typeof restCb[1] === 'string') {
    await handleKeywordAction(ctx, restCb[0] as EKeywordAction, restCb[1])
    return
  }
  if (state === ECallback.GROUP && typeof restCb[1] === 'string') {
    await handleKeywordGroupAction(ctx, restCb[0] as EKeywordAction, restCb[1])
    return
  }
  if (handler) await handler(ctx, callbackQuery)
}
