import { Key } from 'telegram-keyboard'
import { EState } from '../constants'
import { TState, TTelegrafContext } from '../types'
import { enterToState } from '../utils'
import { mainState } from '.'
import { InfoMessage, getDbConnection } from '../../../../../utils'
import {
  deletePublisherKeyword,
  deletePublisherSubscriptionsByKeyword,
  selectPublisherSubscriptionsByChannelId,
} from '../../../../../utils/mysql-queries'

export const keywordSettingsState: TState = {
  stateName: EState.KEYWORD_SETTINGS,
  menu: async ctx => {
    return {
      text: 'Настройка ключевых слов',
      buttons: [
        [
          [
            'Вывести кл. слова через запятую',
            async () => {
              const db = await getDbConnection()
              const keywordRows = await selectPublisherSubscriptionsByChannelId(
                db,
                ctx.session.channel.id,
              )
              await db.close()
              await ctx.reply(
                keywordRows.reduce((acc, keywordRow) => {
                  if (acc) return `${acc}, ${keywordRow.keyword}`
                  return keywordRow.keyword
                }, ''),
              )
            },
          ],
        ],
        [
          [
            '🏠 В главное меню',
            async () => {
              ctx.session.channel = undefined
              await enterToState(ctx, mainState)
            },
          ],
        ],
      ],
    }
  },
  inlineMenu: async ctx => {
    const db = await getDbConnection()
    const keywordRows = await selectPublisherSubscriptionsByChannelId(db, ctx.session.channel.id)
    await db.close()
    return {
      text: `Список ключевых слов @${ctx.session.channel.name}`,
      buttons: keywordRows.map(keywordRow => [
        Key.callback(`🗑 ${keywordRow.keyword}`, `${keywordRow.keyword}|del`),
      ]),
    }
  },
  onCallback: async <EState>(ctx: TTelegrafContext, callback: EState | string) => {
    if (typeof callback === 'string') {
      const [keyword, command] = callback.split('|')
      if (command === 'del') {
        const db = await getDbConnection()
        await deletePublisherSubscriptionsByKeyword(db, keyword)
        await deletePublisherKeyword(db, keyword)
        await db.close()
      }
      await enterToState(ctx, keywordSettingsState)
      return
    }
    throw new InfoMessage(`Unknown menu state: ${callback}`)
  },
}
