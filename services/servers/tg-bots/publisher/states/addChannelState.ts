import { Key } from "telegram-keyboard"
import { addKeywordsState, mainState } from "."
import { EState } from "../constants"
import { TState } from "../types"
import { enterToState } from "../utils"

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
        if (text) {
            ctx.session.channel = text
            await enterToState(ctx, addKeywordsState)
            return
        }
    }
}
