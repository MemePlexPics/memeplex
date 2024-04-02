import { TTelegrafContext } from "../types"

export const handleMemePost = async (ctx: TTelegrafContext, chatId: string | number) => {
    await ctx.telegram.forwardMessage(chatId, ctx.chat.id, ctx.callbackQuery.message.message_id)
    await ctx.reply(`Мем успешно опубликован.`)
}
