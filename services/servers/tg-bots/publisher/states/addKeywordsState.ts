import { EState } from '../constants'
import { TState } from '../types'
import { addSubscription, enterToState, logUserAction } from '../utils'
import { channelSettingState } from '.'
import { getDbConnection } from '../../../../../utils'
import { i18n } from '../i18n'

export const addKeywordsState: TState = {
  stateName: EState.ADD_KEYWORDS,
  menu: async () => {
    return {
      text: i18n['ru'].message.mySubscriptions(),
      buttons: [[[i18n['ru'].button.back(), ctx => enterToState(ctx, channelSettingState)]]],
    }
  },
  onText: async (ctx, keywordsRaw) => {
    if (!ctx.from) {
      throw new Error('There is no ctx.from')
    }
    if (!ctx.session.channel) {
      throw new Error(`ctx.session.channel is undefined in addKeywordsState`)
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
      await ctx.reply(i18n['ru'].message.delimetersInsteadOfKeywords())
      return
    }

    await addSubscription(db, ctx.session.channel.id, keywordValuesNotEmpty)
    await db.close()

    await ctx.reply(i18n['ru'].message.addedKeywords())
    logUserAction(ctx, {
      info: `Added`,
      keywords: keywordValuesNotEmpty.map(keywordRow => keywordRow.keyword).join(', '),
    })
    await enterToState(ctx, channelSettingState)
    return
  },
}
