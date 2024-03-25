import { Key } from "telegram-keyboard"
import { addKeywordsState, mainState } from "."
import { EState } from "../constants"
import { TState } from "../types"
import { enterToState } from "../utils"
import { drizzle } from "drizzle-orm/mysql2"
import { botPublisherChannels } from "../../../../../db/schema"
import { getMysqlClient } from '../../../../../utils'

export const addChannelState: TState<EState> = {
    stateName: EState.ADD_CHANNEL,
    message: () => 'Введитие название канала в формате @name или https://t.me/name',
    inlineMenu: () => ({
        text: 'Меню',
        buttons: [
            Key.callback('Назад', EState.MAIN),
        ],
    }),
    onCallback: (ctx) => enterToState(ctx, mainState),
    onText: async (ctx, text) => {
        const channel = text.replace('@', '').replace('https://t.me', '')
        if (!channel) {
            await ctx.reply('Пожалуйста, проверьте корректность названия. Формат: @name или https://t.me/name')
            return
        }
        const botInfo = await ctx.telegram.getMe()
        const botInChat = await ctx.telegram.getChatMember(`@${channel}`, botInfo.id)
        if (botInChat.status !== 'administrator') {
            await ctx.reply(`
Для публикации от имени канала @${channel} боту необходимо предоставить админ-права.
После предоставления прав повторите, пожалуйста, отправку названия канала в том же формате.`
            )
            return
        }
        // TODO: if (chat.type === 'private') => ???
        const chat = await ctx.telegram.getChat(`@${channel}`)
        const subscribers = await ctx.telegram.getChatMembersCount(`@${channel}`)
        if (channel) {
            ctx.session.channel = {
                name: channel,
                id: chat.id,
            }

            const db = drizzle(await getMysqlClient())
            const timestamp = Date.now() / 1000
            await db.insert(botPublisherChannels).values({
                id: chat.id,
                userId: ctx.from.id,
                username: channel,
                subscribers,
                timestamp,
            })
            await enterToState(ctx, addKeywordsState)
            return
        }
    }
}
