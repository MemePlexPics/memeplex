import { Key } from "telegram-keyboard"
import { EState } from "../constants"
import { TState, TTelegrafContext } from "../types"
import { enterToState } from "../utils"
import { mainState } from "."

export const keywordSettingsState: TState<EState> = {
    stateName: EState.KEYWORD_SETTINGS,
    inlineMenu: (ctx) => ({
        text: `Настройка ключевых слов @${ctx.session.channel}`,
        buttons: ['tits','peaches'].map(keyword => ([
            Key.callback(keyword, keyword),
            Key.callback('Del', `${keyword}|del`),
        ])).concat([
            Key.callback('В главное меню', EState.MAIN)
        ]),
        options: {
            flat: true,
            columns: 2,
        },
    }),
    onCallback: async <EState>(ctx: TTelegrafContext, callback: EState | string) => {
        if (callback === EState.MAIN) {
            ctx.session.channel = undefined
            await enterToState(ctx, mainState)
            return
        }
        if (typeof callback === 'string') {
            const [channel, command] = callback.split('|')
            console.log({channel, command})
            await ctx.reply('Ключевые слова приняты!')
            await enterToState(ctx, mainState)
        }
    }
}
