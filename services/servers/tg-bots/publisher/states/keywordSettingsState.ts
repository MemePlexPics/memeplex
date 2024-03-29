import { Key } from "telegram-keyboard"
import { EState } from "../constants"
import { TState, TTelegrafContext } from "../types"
import { enterToState } from "../utils"
import { mainState } from "."
import { drizzle } from "drizzle-orm/mysql2"
import { getMysqlClient } from '../../../../../utils'
import { botPublisherKeywords, botPublisherSubscriptions } from "../../../../../db/schema"
import { eq } from "drizzle-orm"
import { deletePublisherKeyword } from "../../../../../utils/mysql-queries"

export const keywordSettingsState: TState<EState> = {
    stateName: EState.KEYWORD_SETTINGS,
    inlineMenu: async (ctx) => {
        const db = drizzle(await getMysqlClient())
        const keywordRows = await db
            .select({ keyword: botPublisherSubscriptions.keyword })
            .from(botPublisherSubscriptions)
            .where(eq(botPublisherSubscriptions.channelId, ctx.session.channel.id))
        return {
            text: `Настройка ключевых слов @${ctx.session.channel}`,
            buttons: keywordRows.map(keywordRow => ([
                // Key.callback(keyword, keyword),
                Key.callback(`🗑 ${keywordRow.keyword}`, `${keywordRow.keyword}|del`),
            ])).concat([[
                Key.callback('🏠 В главное меню', EState.MAIN)
            ]]),
        }
    },
    onCallback: async <EState>(ctx: TTelegrafContext, callback: EState | string) => {
        if (callback === EState.MAIN) {
            ctx.session.channel = undefined
            await enterToState(ctx, mainState)
            return
        }
        if (typeof callback === 'string') {
            const [keyword, command] = callback.split('|')
            if (command === 'del') {
                const db = drizzle(await getMysqlClient())
                await db
                    .delete(botPublisherSubscriptions)
                    .where(eq(botPublisherSubscriptions.keyword, keyword))
                await deletePublisherKeyword(db, keyword)
            }
            await enterToState(ctx, mainState)
        }
    }
}
