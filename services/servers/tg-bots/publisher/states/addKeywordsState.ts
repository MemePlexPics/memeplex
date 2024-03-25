import { Key } from "telegram-keyboard"
import { EState } from "../constants"
import { TState } from "../types"
import { enterToState } from "../utils"
import { channelSettingState } from "."

export const addKeywordsState: TState<EState> = {
    stateName: EState.ADD_KEYWORDS,
    message: () => 'Введите список ключевых слов через запятую или каждое ключевое слово на новой строке)',
    inlineMenu: () => ({
        text: 'Меню',
        buttons: [
            Key.callback('Назад', EState.CHANNEL_SETTINGS),
        ],
    }),
    onCallback: (ctx) => enterToState(ctx, channelSettingState),
    onText: async (ctx, keywords) => {
        if (keywords) {
            console.log(keywords.split(',').map(line => line.split('\n')).flat())
            await enterToState(ctx, channelSettingState)
            return
        }
    }
}
