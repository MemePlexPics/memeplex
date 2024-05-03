import { logUserAction } from '.'
import { getDbConnection } from '../../../../../utils'
import {
  deletePublisherSubscription,
  selectPublisherChannelsByUserId,
} from '../../../../../utils/mysql-queries'
import { ECallback, EKeywordAction } from '../constants'
import { isCallbackButton, isCommonMessage } from '../typeguards'
import { TTelegrafContext } from '../types'

export const handleKeywordAction = async (
  ctx: TTelegrafContext,
  command: EKeywordAction,
  keyword: string,
) => {
  if (command === EKeywordAction.DELETE) {
    const db = await getDbConnection()
    const userChannels = await selectPublisherChannelsByUserId(db, ctx.from.id)
    for (const channel of userChannels) {
      await deletePublisherSubscription(db, channel.id, [keyword])
    }
    await db.close()
    if (
      isCommonMessage(ctx.callbackQuery?.message) &&
      ctx.callbackQuery.message.reply_markup?.inline_keyboard
    ) {
      await ctx.editMessageReplyMarkup({
        inline_keyboard: ctx.callbackQuery.message.reply_markup.inline_keyboard.map(row =>
          row.filter(
            column =>
              !isCallbackButton(column) ||
              column.callback_data !== `${ECallback.KEY}|${EKeywordAction.DELETE}|${keyword}`,
          ),
        ),
      })
    }
    await ctx.reply(
      `Ключевое слово «${keyword}» успешно удалено.`,
      ctx.callbackQuery?.message
        ? {
          reply_parameters: {
            message_id: ctx.callbackQuery.message.message_id,
          },
        }
        : undefined,
    )
    logUserAction(ctx.from, {
      info: `Unsubscribe from a keyword`,
      keyword,
    })
  }
}
