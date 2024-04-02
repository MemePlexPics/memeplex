import { Key } from 'telegram-keyboard'
import { EState } from '../constants'
import { TState, TTelegrafContext } from '../types'
import { enterToState } from '../utils'
import { mainState } from '.'
import { InfoMessage, getDbConnection } from '../../../../../utils'
import {
  deletePublisherKeyword,
  deletePublisherSubscriptionsByKeyword,
  selectPublisherSubscriptionsByChannelId
} from '../../../../../utils/mysql-queries'

export const keywordSettingsState: TState<EState> = {
  stateName: EState.KEYWORD_SETTINGS,
  inlineMenu: async (ctx) => {
    const db = await getDbConnection()
    const keywordRows = await selectPublisherSubscriptionsByChannelId(
      db,
      ctx.session.channel.id
    )
    return {
      text: `Настройка ключевых слов @${ctx.session.channel.name}`,
      buttons: keywordRows
        .map((keywordRow) => [
          // Key.callback(keyword, keyword),
          Key.callback(`🗑 ${keywordRow.keyword}`, `${keywordRow.keyword}|del`)
        ])
        .concat([[Key.callback('🏠 В главное меню', EState.MAIN)]])
    }
  },
  onCallback: async <EState>(
    ctx: TTelegrafContext,
    callback: EState | string
  ) => {
    if (callback === EState.MAIN) {
      ctx.session.channel = undefined
      await enterToState(ctx, mainState)
      return
    }
    if (typeof callback === 'string') {
      const [keyword, command] = callback.split('|')
      if (command === 'del') {
        const db = await getDbConnection()
        await deletePublisherSubscriptionsByKeyword(db, keyword)
        await deletePublisherKeyword(db, keyword)
      }
      await enterToState(ctx, mainState)
      return
    }
    throw new InfoMessage(`Unknown menu state: ${callback}`)
  }
}
