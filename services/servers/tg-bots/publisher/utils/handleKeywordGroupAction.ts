import { logUserAction } from '.'
import { getDbConnection } from '../../../../../utils'
import {
  deletePublisherGroupSubscription,
  selectPublisherChannelsByUserId,
} from '../../../../../utils/mysql-queries'
import { ECallback, EKeywordAction } from '../constants'
import { isCallbackButton, isCommonMessage } from '../typeguards'
import { TTelegrafContext } from '../types'

export const handleKeywordGroupAction = async (
  ctx: TTelegrafContext,
  command: EKeywordAction,
  keywordGroup: string,
) => {
  if (command === EKeywordAction.DELETE) {
    const db = await getDbConnection()
    const userChannels = await selectPublisherChannelsByUserId(db, ctx.from.id)
    for (const channel of userChannels) {
      await deletePublisherGroupSubscription(db, channel.id, keywordGroup)
    }
    await db.close()
    if (isCommonMessage(ctx.callbackQuery?.message) && ctx.callbackQuery.message.reply_markup) {
      await ctx.editMessageReplyMarkup({
        inline_keyboard: ctx.callbackQuery.message.reply_markup.inline_keyboard.map(row =>
          row.filter(
            column =>
              !isCallbackButton(column) ||
              column.callback_data !==
                `${ECallback.GROUP}|${EKeywordAction.DELETE}|${keywordGroup}`,
          ),
        ),
      })
    }
    await ctx.reply(
      `Группа ключевых слов «${keywordGroup}» успешно удалена.`,
      ctx.callbackQuery?.message
        ? {
          reply_parameters: {
            message_id: ctx.callbackQuery.message.message_id,
          },
        }
        : undefined,
    )
    logUserAction(ctx.from, {
      info: `Unsubscribe from a keyword group`,
      keywordGroup,
    })
  }
}
