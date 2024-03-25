import { Key } from "telegram-keyboard"
import { EState } from "../constants"
import { TState, TTelegrafContext } from "../types"
import { enterToState } from "../utils"
import { addKeywordsState, keywordSettingsState, mainState } from "."

export const channelSettingState: TState<EState> = {
    stateName: EState.CHANNEL_SETTINGS,
    inlineMenu: (ctx) => ({
        text: `Настройки канала ${ctx.session.channel}`,
        buttons: [
            [
              Key.callback('Добавить ключевые слова', EState.ADD_KEYWORDS),
            ],
            [
              Key.callback('Редактировать ключевые слова', EState.KEYWORD_SETTINGS),
            ],
            [
              Key.callback('В главное меню', EState.MAIN),
            ],
        ],
    }),
    onCallback: async <EState>(ctx: TTelegrafContext, callback: EState | string) => {
        if (callback === EState.ADD_KEYWORDS) {
            await enterToState(ctx, addKeywordsState)
            return
        }
        if (callback === EState.KEYWORD_SETTINGS) {
            await enterToState(ctx, keywordSettingsState)
            return
        }
        if (callback === EState.MAIN) {
            ctx.session.channel = undefined
            await enterToState(ctx, mainState)
            return
        }
    }
}
