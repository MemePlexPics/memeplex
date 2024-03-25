import { Key } from "telegram-keyboard"
import { EState } from "../constants"
import { TState, TTelegrafContext } from "../types"
import { enterToState } from "../utils"
import { addChannelState, channelSettingState } from "."

export const channelSelectState: TState<EState> = {
    stateName: EState.CHANNEL_SELECT,
    inlineMenu: () => ({
        text: 'Выберите канал',
        buttons: [
            ['first', 'second', 'third'].map(channel => Key.callback(channel, channel)),
            [
              Key.callback('Добавить канал', EState.ADD_CHANNEL)
            ],
        ],
    }),
    onCallback: async <EState>(ctx: TTelegrafContext, callback: EState | string) => {
        if (callback === EState.ADD_CHANNEL) {
            await enterToState(ctx, addChannelState)
            return
        }
        if (typeof callback === 'string') {
            ctx.session.channel = callback
            await enterToState(ctx, channelSettingState)
            return
        }
    }
}
