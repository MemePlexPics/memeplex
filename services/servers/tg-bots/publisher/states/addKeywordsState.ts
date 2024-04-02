import { Key } from 'telegram-keyboard'
import { EState } from '../constants'
import { TState } from '../types'
import { enterToState } from '../utils'
import { channelSettingState } from '.'
import { getDbConnection } from '../../../../../utils'
import {
  insertPublisherKeywords,
  insertPublisherSubscription
} from '../../../../../utils/mysql-queries'

export const addKeywordsState: TState<EState> = {
  stateName: EState.ADD_KEYWORDS,
  message: () =>
    'Введите список ключевых слов через запятую или каждое ключевое слово на новой строке)',
  inlineMenu: () => ({
    text: 'Добавление ключевых слов',
    buttons: [Key.callback('⬅️ Назад', EState.CHANNEL_SETTINGS)]
  }),
  onCallback: (ctx) => enterToState(ctx, channelSettingState),
  onText: async (ctx, keywordsRaw) => {
    const db = await getDbConnection()
    const keywords = keywordsRaw
      .split('\n')
      .map((line) => line.split(','))
      .flat()
    const keywordValues = keywords.map((keyword) => {
      const keywordTrimmed = keyword.replace('|', '').toLowerCase().trim()
      return {
        keyword: keywordTrimmed
      }
    })
    const keywordValuesNotEmpty = keywordValues.filter(
      (keywordObj) => keywordObj.keyword.length
    )
    if (keywordValuesNotEmpty.length === 0) {
      await ctx.reply(
        'В отправленном сообщении не обнаружено ключевых слов, только запятые или переносы строк'
      )
      return
    }

    await insertPublisherKeywords(db, keywordValues)

    const subscriptions = keywords.map((keyword) => ({
      keyword,
      channelId: ctx.session.channel.id
    }))

    await insertPublisherSubscription(db, subscriptions)

    await ctx.reply('Ключевые слова добавлены!')
    await enterToState(ctx, channelSettingState)
    return
  }
}
