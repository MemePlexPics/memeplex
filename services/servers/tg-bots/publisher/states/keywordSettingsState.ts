import { Key } from 'telegram-keyboard'
import { EState } from '../constants'
import { TState, TTelegrafContext } from '../types'
import { enterToState, logUserAction } from '../utils'
import { mainState } from '.'
import { InfoMessage, getDbConnection, sqlWithPagination } from '../../../../../utils'
import {
  countPublisherSubscriptionsByChannelId,
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
              ctx.session.pagination = undefined
              await enterToState(ctx, mainState)
            },
          ],
        ],
      ],
    }
  },
  inlineMenu: async ctx => {
    if (!ctx.session.pagination) {
      ctx.session.pagination = {
        page: 1
      }
    }
    const page = ctx.session.pagination.page
    const db = await getDbConnection()
    const totalSubscriptions = await countPublisherSubscriptionsByChannelId(
      db,
      ctx.session.channel.id,
    )
    const paginationButtons = []
    const pageSize = 98 // 100 is the maximum, 98 to don't mind pagination buttons
    if (page > 1) paginationButtons.push(Key.callback(`◀️ Назад`, `page|back`))
    if ((totalSubscriptions - (page - 1) * pageSize) / 100 > 1)
      paginationButtons.push(Key.callback(`▶️ Вперед`, `page|next`))
    const keywordRows = await sqlWithPagination(
      selectPublisherSubscriptionsByChannelId(db, ctx.session.channel.id).$dynamic(),
      page,
      pageSize,
    )
    await db.close()
    return {
      text: `Список ключевых слов @${ctx.session.channel.name}`,
      buttons: keywordRows
        .map(keywordRow => [Key.callback(`🗑 ${keywordRow.keyword}`, `del|${keywordRow.keyword}`)])
        .concat([paginationButtons]),
    }
  },
  onCallback: async (ctx: TTelegrafContext, callback: string) => {
    const [command, argument] = callback.split('|')
    if (command === 'del') {
      const db = await getDbConnection()
      await deletePublisherSubscriptionsByKeyword(db, argument)
      await deletePublisherKeyword(db, argument)
      await db.close()
      logUserAction(ctx.from, {
        state: EState.KEYWORD_SETTINGS,
        error: `Deleted`,
        keyword: argument,
      })
    } else if (command === 'page') {
      if (argument === 'next') {
        ctx.session.pagination.page++
      } else {
        ctx.session.pagination.page--
      }
    } else {
      throw new InfoMessage(`Unknown menu state: ${callback}`)
    }
    await enterToState(ctx, keywordSettingsState)
    return
  },
}
