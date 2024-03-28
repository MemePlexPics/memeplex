import { Key } from "telegram-keyboard"
import { EState } from "../constants"
import { TState } from "../types"
import { enterToState } from "../utils"
import { channelSettingState } from "."
import { drizzle } from "drizzle-orm/mysql2"
import { botPublisherKeywords, botPublisherSubscriptions } from "../../../../../db/schema"
import { getMysqlClient } from '../../../../../utils'
import { inArray, sql } from "drizzle-orm"

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
            .flat(2)
        const keywordValues = keywords.map((keyword) => ({
            keyword,
        }))

        await db.insert(botPublisherKeywords)
            .values(keywordValues)
            .onDuplicateKeyUpdate({ set: { id: sql`id` }})

        const existedKeywords = await db
            .select({ id: botPublisherKeywords.id })
            .from(botPublisherKeywords)
            .where(inArray(botPublisherKeywords.keyword, keywords))

        const subscriptions = existedKeywords.map(({ id }) => ({
            keywordId: id,
            channelId: ctx.session.channel.id,
        }))

        await db.insert(botPublisherSubscriptions)
            .values(subscriptions)
            .onDuplicateKeyUpdate({ set: { id: sql`id` } })

        await ctx.reply('Ключевые слова добавлены!')
        await enterToState(ctx, channelSettingState)
        return
    }
}
