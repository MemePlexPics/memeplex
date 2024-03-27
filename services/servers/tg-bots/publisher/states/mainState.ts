import { Key } from "telegram-keyboard"
import { EState } from "../constants"
import { TState } from "../types"
import { enterToState } from "../utils"
import { addChannelState, channelSelectState } from "."
import { drizzle } from "drizzle-orm/mysql2"
import { getMysqlClient } from '../../../../../utils'
import { botPublisherChannels } from "../../../../../db/schema"
import { count, eq } from "drizzle-orm"

export const mainState: TState<EState> = {
    stateName: EState.MAIN,
    inlineMenu: async (ctx) => {
        const db = drizzle(await getMysqlClient())
        const userChannels = await db
            .select({ values: count() })
            .from(botPublisherChannels)
            .where(eq(botPublisherChannels.userId, ctx.from.id))
        return {
            text: 'Добро пожаловать в MemePlex Publisher!',
            buttons: [
                [
                    Key.callback('Добавить канал', EState.ADD_CHANNEL),
                ],
                userChannels[0].values !== 0
                    ? [
                        Key.callback('Настройки каналов', EState.CHANNEL_SELECT),
                    ]
                    : undefined,
            ],
        }
    },
    onCallback: async (ctx, state) => {
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
