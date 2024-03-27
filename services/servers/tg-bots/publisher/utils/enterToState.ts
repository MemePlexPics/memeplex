import { Keyboard } from "telegram-keyboard"
import { TState, TTelegrafContext } from "../types"
import { EState } from "../constants"

export const enterToState = async <GStateName extends EState>(ctx: TTelegrafContext, state: TState<GStateName>) => {
    ctx.session.state = state.stateName
    if (state.inlineMenu) {
        const inlineMenu = await state.inlineMenu(ctx)
        await ctx.reply(inlineMenu.text, Keyboard.make(inlineMenu.buttons).inline())
        const message = state.message?.(ctx)
        if (message) ctx.reply(message)
        return
    }
}
