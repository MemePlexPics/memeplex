import { Key } from "telegram-keyboard"
import { EState } from "../constants"
import { TState } from "../types"
import { enterToState } from "../utils"
import { addChannelState, channelSelectState } from "."

export const mainState: TState<EState> = {
    stateName: EState.MAIN,
    inlineMenu: () => ({
        text: 'Добро пожаловать в MemePlex Publisher!',
        buttons: [
            Key.callback('Добавить канал', EState.ADD_CHANNEL),
            Key.callback('Настройки каналов', EState.CHANNEL_SELECT),
        ],
    }),
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
