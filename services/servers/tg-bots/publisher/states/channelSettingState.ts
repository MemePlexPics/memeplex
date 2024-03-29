import { Key } from "telegram-keyboard"
import { EState } from "../constants"
import { TState, TTelegrafContext } from "../types"
import { enterToState } from "../utils"
import { addKeywordsState, keywordSettingsState, mainState } from "."
import { drizzle } from "drizzle-orm/mysql2"
import { getMysqlClient } from '../../../../../utils'
import { countPublisherSubscriptionsByChannelId } from "../../../../../utils/mysql-queries"

export const channelSettingState: TState<EState> = {
    stateName: EState.CHANNEL_SETTINGS,
    inlineMenu: async (ctx) => {
      const db = drizzle(await getMysqlClient())
      const keywordsCount = await countPublisherSubscriptionsByChannelId(db, ctx.session.channel.id)
      const hasKeywords = keywordsCount?.[0]?.value !== 0
      const buttons = [
        [
          Key.callback('➕ Добавить ключевые слова', EState.ADD_KEYWORDS),
        ],
        [
          Key.callback('🏠 В главное меню', EState.MAIN),
        ],
      ]
      if (hasKeywords) buttons.splice(1, 0, [
        Key.callback('✏️ Редактировать ключевые слова', EState.KEYWORD_SETTINGS),
      ])
      return {
        text: `Настройки канала @${ctx.session.channel.name}`,
        buttons,
      }
    },
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
