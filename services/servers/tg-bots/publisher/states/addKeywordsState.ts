import { EState } from '../constants'
import { TState } from '../types'
import { enterToState, logUserAction } from '../utils'
import { channelSettingState } from '.'
import { getDbConnection } from '../../../../../utils'
import {
  insertPublisherKeywords,
  insertPublisherSubscription,
} from '../../../../../utils/mysql-queries'

export const addKeywordsState: TState = {
  stateName: EState.ADD_KEYWORDS,
  menu: async () => {
    return {
      text: 'Введите список ключевых слов через запятую или каждое ключевое слово на новой строке',
      buttons: [[['⬅️ Назад', ctx => enterToState(ctx, channelSettingState)]]],
    }
  },
  onText: async (ctx, keywordsRaw) => {
    const logEntity = {
      state: EState.ADD_CHANNEL,
    }
    const db = await getDbConnection()
    const keywords = keywordsRaw
      .split('\n')
      .map(line => line.split(','))
      .flat()
    const keywordValues = keywords.map(keyword => {
      const keywordTrimmed = keyword.replace('|', '').toLowerCase().trim()
      return {
        keyword: keywordTrimmed,
      }
    })
    const keywordValuesNotEmpty = keywordValues.filter(keywordObj => keywordObj.keyword.length)
    if (keywordValuesNotEmpty.length === 0) {
      await ctx.reply(
        'В отправленном сообщении не обнаружено слов, только запятые и/или переносы строк',
      )
      return
    }

    await insertPublisherKeywords(db, keywordValuesNotEmpty)

    const subscriptions = keywordValuesNotEmpty.map(({ keyword }) => ({
      keyword,
      channelId: ctx.session.channel.id,
    }))

    await insertPublisherSubscription(db, subscriptions)
    await db.close()

    await ctx.reply('Ключевые слова добавлены!')
    logUserAction(ctx.from, {
      ...logEntity,
      info: `Added`,
      keywords: keywordValuesNotEmpty.join(', '),
    })
    await enterToState(ctx, channelSettingState)
    return
  },
}
