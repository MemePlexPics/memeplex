import { Key } from "telegram-keyboard"
import { EState } from "../constants"
import { TState } from "../types"
import { enterToState } from "../utils"
import { channelSettingState } from "."
import { drizzle } from "drizzle-orm/mysql2"
import { getMysqlClient } from '../../../../../utils'
import { insertPublisherKeywords, insertPublisherSubscription } from "../../../../../utils/mysql-queries"

export const addKeywordsState: TState<EState> = {
    stateName: EState.ADD_KEYWORDS,
    message: () => 'Введите список ключевых слов через запятую или каждое ключевое слово на новой строке)',
    inlineMenu: () => ({
        text: 'Добавление ключевых слов',
        buttons: [
            Key.callback('⬅️ Назад', EState.CHANNEL_SETTINGS),
        ],
    }),
    onCallback: (ctx) => enterToState(ctx, channelSettingState),
    onText: async (ctx, keywordsRaw) => {
        const db = drizzle(await getMysqlClient())
        const keywords = keywordsRaw
            .split('\n')
            .map(line => line.split(','))
            .flat()
        const keywordValues = keywords.map((keyword) => ({
            keyword: keyword.replace('|', '').toLowerCase(),
        }))

        await insertPublisherKeywords(db, keywordValues)

        const subscriptions = keywords.map((keyword) => ({
            keyword,
            channelId: ctx.session.channel.id,
        }))

        await insertPublisherSubscription(db, subscriptions)

        await ctx.reply('Ключевые слова добавлены!')
        await enterToState(ctx, channelSettingState)
        return
    }
}
