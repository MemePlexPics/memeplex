import { Key } from 'telegram-keyboard'
import { EState } from '../constants'
import { TState, TTelegrafContext } from '../types'
import { addSubscription, enterToState, logUserAction } from '../utils'
import { addKeywordsState } from '.'
import { InfoMessage, getDbConnection } from '../../../../../utils'
import {
  selectPublisherKeywordGroupByName,
  selectPublisherKeywordGroups,
} from '../../../../../utils/mysql-queries'

export const keywordGroupSelectState: TState = {
  stateName: EState.KEYWORD_GROUP_SELECT,
  inlineMenu: async _ctx => {
    const db = await getDbConnection()
    const keywordGroups = await selectPublisherKeywordGroups(db)
    await db.close()
    const text = keywordGroups.reduce<string>((string, { name, keywords }) => {
      return (
        string +
        `
${name}:
${keywords}
    `
      )
    }, 'Выберите группу ключевых слов для подписки.\n')
    return {
      text,
      buttons: keywordGroups.map(({ name }) => [Key.callback(`➕ Подписаться на «${name}»`, name)]),
    }
  },
  menu: async () => {
    return {
      text: 'Меню добавления группы ключевых слов',
      buttons: [[['⬅️ Назад', ctx => enterToState(ctx, addKeywordsState)]]],
    }
  },
  onCallback: async (ctx: TTelegrafContext, callback: string) => {
    const db = await getDbConnection()
    const keywordGroup = await selectPublisherKeywordGroupByName(db, callback)
    if (!keywordGroup.length) throw new InfoMessage(`Unknown menu state: ${callback}`)
    logUserAction(ctx.from, {
      state: EState.KEYWORD_GROUP_SELECT,
      group: callback,
    })
    const keywords = keywordGroup[0].keywords.split(', ').map(keyword => ({ keyword }))
    await addSubscription(db, ctx.session.channel.id, keywords)
    await ctx.reply(`Вы успешно подписали на ключевые слова из группы «${callback}»`)
    await db.close()
    return
  },
}