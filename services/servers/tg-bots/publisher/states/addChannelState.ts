import { Key } from "telegram-keyboard"
import { addKeywordsState, mainState } from "."
import { EState } from "../constants"
import { TState } from "../types"
import { enterToState } from "../utils"
import { getDbConnection, getTgChannelName } from '../../../../../utils'
import { insertPublisherChannel } from "../../../../../utils/mysql-queries"

export const addChannelState: TState<EState> = {
    stateName: EState.ADD_CHANNEL,
    message: () => 'Введитие название канала в формате @name или https://t.me/name',
    inlineMenu: () => ({
        text: 'Добавление канала',
        buttons: [
            Key.callback('⬅️ Назад', EState.MAIN),
        ],
    }),
    onCallback: (ctx) => enterToState(ctx, mainState),
    onText: async (ctx, text) => {
        const channel = getTgChannelName(text)
        if (!channel) {
            await ctx.reply('Пожалуйста, проверьте корректность названия. Формат: @name или https://t.me/name')
            return
        }
        const chat = await ctx.telegram.getChat(`@${channel}`)
        if (chat.type === 'private') {
            await ctx.reply(`
                Для того, чтобы подписаться самому, выберите в главном меню кнопку "Добавить себя".
                Вернитесь назад в главное меню или отправьте название канала.`
            )
            return
        }
        const administrators = await ctx.telegram.getChatAdministrators(`@${channel}`)
        let isOurUserAnAdmin: boolean
        let isOurBotAnAdmin: boolean
        administrators.some(admin => {
            if (!isOurUserAnAdmin && admin.user.id === ctx.from.id) {
                isOurUserAnAdmin = true
            } else if (!isOurBotAnAdmin && admin.user.id === ctx.botInfo.id) {
                isOurBotAnAdmin = true
            }
            return isOurUserAnAdmin && isOurBotAnAdmin
        })
        if (!isOurUserAnAdmin) {
            await ctx.reply(`
                Добавить подписку на канал может только администратор канала.
                Если вы хотите только подписаться на мемы, то вернитесь назад в главном меню и выберите соответствующий пункт.
            `)
            return
        }
        if (!isOurBotAnAdmin) {
            await ctx.reply(`
                Для публикации в канал @${channel} боту необходимо предоставить админ-права.
                После предоставления прав повторите, пожалуйста, отправку названия канала в том же формате.`
            )
            return
        }
        const subscribers = await ctx.telegram.getChatMembersCount(`@${channel}`)
        if (channel) {
            ctx.session.channel = {
                id: chat.id,
                name: channel,
                type: chat.type,
            }

            const db = await getDbConnection()
            const timestamp = Date.now() / 1000
            await insertPublisherChannel(db, {
                id: chat.id,
                userId: ctx.from.id,
                username: channel,
                subscribers,
                type: chat.type,
                timestamp,
            })
            await enterToState(ctx, addKeywordsState)
            return
        }
    }
}
