import { Key } from 'telegram-keyboard'
import { EState } from '../constants'
import { TState, TTelegrafContext } from '../types'
import { enterToState } from '../utils'
import { addKeywordsState, keywordSettingsState, mainState } from '.'
import { InfoMessage, getDbConnection } from '../../../../../utils'
import {
  countPublisherSubscriptionsByChannelId,
  deletePublisherChannelById
} from '../../../../../utils/mysql-queries'

const DELETE_CHANNEL = 'delete_channel'

export const channelSettingState: TState<EState> = {
  stateName: EState.CHANNEL_SETTINGS,
  inlineMenu: async (ctx) => {
    const db = await getDbConnection()
    const keywordsCount = await countPublisherSubscriptionsByChannelId(
      db,
      ctx.session.channel.id
    )
    const hasKeywords = keywordsCount?.[0]?.value !== 0
    const buttons = [
      [Key.callback('➕ Добавить ключевые слова', EState.ADD_KEYWORDS)],
      [Key.callback('🗑 Удалить канал', DELETE_CHANNEL)],
      [Key.callback('🏠 В главное меню', EState.MAIN)]
    ]
    if (hasKeywords)
      buttons.splice(1, 0, [
        Key.callback('✏️ Редактировать ключевые слова', EState.KEYWORD_SETTINGS)
      ])
    return {
      text: `Настройка подписки ${ctx.session.channel.name}`,
      buttons
    }
  },
  onCallback: async <EState>(
    ctx: TTelegrafContext,
    callback: EState | string
  ) => {
    if (callback === EState.ADD_KEYWORDS) {
      await enterToState(ctx, addKeywordsState)
      return
    }
    if (callback === EState.KEYWORD_SETTINGS) {
      await enterToState(ctx, keywordSettingsState)
      return
    }
    if (callback === DELETE_CHANNEL) {
      const db = await getDbConnection()
      await deletePublisherChannelById(db, ctx.session.channel.id)
      await ctx.reply(`Канал успешно удален`)
      ctx.session.channel = undefined
      await enterToState(ctx, mainState)
      return
    }
    if (callback === EState.MAIN) {
      ctx.session.channel = undefined
      await enterToState(ctx, mainState)
      return
    }
    throw new InfoMessage(`Unknown menu state: ${callback}`)
  }
}
