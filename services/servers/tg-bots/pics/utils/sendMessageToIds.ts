import type { Telegraf } from 'telegraf'
import type { TTelegrafContext } from '../types'
import type { ExtraReplyMessage } from 'telegraf/typings/telegram-types'

export const sendMessageToIds = async (
  bot: Telegraf<TTelegrafContext>,
  ids: number[],
  text: string,
  options?: ExtraReplyMessage,
) => {
  const failed = []
  for (const id in ids) {
    try {
      await bot.telegram.sendMessage(id, text, options)
    } catch (error) {
      if (error instanceof Error) {
        failed.push({
          id,
          error: error.name,
          message: error.message,
        })
      }
    }
  }
  console.log(JSON.stringify(failed, null, 2))
}
