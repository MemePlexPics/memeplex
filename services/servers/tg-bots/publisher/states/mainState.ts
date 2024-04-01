import { Key } from "telegram-keyboard"
import { EState } from "../constants"
import { TState } from "../types"
import { enterToState } from "../utils"
import { addChannelState, addKeywordsState, channelSelectState } from "."
import { drizzle } from "drizzle-orm/mysql2"
import { getMysqlClient } from '../../../../../utils'
import { countPublisherChannelsByUserId, insertPublisherChannel } from '../../../../../utils/mysql-queries'
import { getTelegramUser } from "../../utils"

const ADD_MYSELF = 'add_myself'

export const mainState: TState<EState> = {
    stateName: EState.MAIN,
    inlineMenu: async (ctx) => {
        const db = drizzle(await getMysqlClient())
        const userChannels = await countPublisherChannelsByUserId(db, ctx.from.id)
        const buttons = [
            [
                Key.callback('Добавить канал', EState.ADD_CHANNEL),
            ],
            [
                Key.callback('Добавить себя', ADD_MYSELF),
            ],
        ]
        if (userChannels[0].values !== 0) buttons.push([
            Key.callback('Настройки подписок', EState.CHANNEL_SELECT),
        ])
        return {
            text: 'Меню подписок',
            buttons,
        }
    },
    onCallback: async (ctx, state) => {
        if (state === ADD_MYSELF) {
            const username = getTelegramUser(ctx.from, '')
            ctx.session.channel = {
                name: username,
                id: ctx.from.id,
                type: 'private'
            }
            const db = drizzle(await getMysqlClient())
            const timestamp = Date.now() / 1000
            await insertPublisherChannel(db, {
                id: ctx.from.id,
                userId: ctx.from.id,
                username: username.user,
                subscribers: null,
                timestamp,
            })
            await enterToState(ctx, addKeywordsState)
        }
        if (state === EState.ADD_CHANNEL) {
            await enterToState(ctx, addChannelState)
            return
        }
        if (state === EState.CHANNEL_SELECT) {
            await enterToState(ctx, channelSelectState)
            return
        }
    }
}
