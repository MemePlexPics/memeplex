import { logUserAction } from '.'
import { getDbConnection } from '../../../../../utils'
import {
  deletePublisherSubscription,
  selectPublisherChannelsByUserId,
} from '../../../../../utils/mysql-queries'
import { isAccessibleMessage, isCallbackButton, isCommonMessage } from '../typeguards'
import { TTelegrafContext } from '../types'

export const handleKeyAction = async (ctx: TTelegrafContext, command: 'del', keyword: string) => {
  if (command === 'del') {
    const db = await getDbConnection()
    const userChannels = await selectPublisherChannelsByUserId(db, ctx.from.id)
    for (const channel of userChannels) {
      await deletePublisherSubscription(db, channel.id, keyword)
    }
    await db.close()
    if (
      isAccessibleMessage(ctx.callbackQuery.message) &&
      isCommonMessage(ctx.callbackQuery.message)
    ) {
      await ctx.editMessageReplyMarkup({
        inline_keyboard: ctx.callbackQuery.message.reply_markup.inline_keyboard.map(row =>
          row.filter(
            column =>
              !isCallbackButton(column) || column.callback_data !== `key|${command}|${keyword}`,
          ),
        ),
      })
    }
    await ctx.reply(`Ключевое слово «${keyword}» успешно удалено.`, {
      reply_parameters: {
        message_id: ctx.callbackQuery.message.message_id,
      },
    })
    logUserAction(ctx.from, {
      info: `Unsubscribe from a keyword`,
      keyword,
    })
  }
}
