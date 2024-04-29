import { Key } from 'telegram-keyboard'
import { ECallback, EState } from '../constants'
import { TState, TTelegrafContext } from '../types'
import { addSubscription, deleteSubscription, enterToState, logUserAction } from '../utils'
import { addKeywordsState } from '.'
import { InfoMessage, getDbConnection } from '../../../../../utils'
import {
  deletePublisherGroupSubscription,
  insertPublisherGroupSubscription,
  selectPublisherGroupSubscriptionsByUserId,
  selectPublisherKeywordGroupByName,
  selectPublisherKeywordGroups,
} from '../../../../../utils/mysql-queries'
import { i18n } from '../i18n'
import { getPublisherUserTariffPlan } from '../../../../utils'

export const keywordGroupSelectState: TState = {
  stateName: EState.KEYWORD_GROUP_SELECT,
  inlineMenu: async ctx => {
    const db = await getDbConnection()
    const keywordGroups = await selectPublisherKeywordGroups(db)
    const userKeywordGroupsRaw = await selectPublisherGroupSubscriptionsByUserId(db, ctx.from.id)
    const userTariff = await getPublisherUserTariffPlan(db, ctx.from.id)
    const userKeywordGroups = userKeywordGroupsRaw.reduce((acc, { groupName }) => {
      acc.add(groupName)
      return acc
    }, new Set<string>())
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
    const buttons = keywordGroups.map(({ name }) => {
      const isSubscribed = userKeywordGroups.has(name)
      const buttonText = isSubscribed ? `➖ Отписаться от «${name}»` : `➕ Подписаться на «${name}»`
      const callback = `${isSubscribed ? 'del' : 'sub'}|${name}`
      return [Key.callback(buttonText, callback)]
    })
    if (userTariff === 'free')
      buttons.push([Key.callback('💵 Оплатить платный тариф', ECallback.PAY)])
    return {
      text,
      buttons,
    }
  },
  menu: async ctx => {
    const db = await getDbConnection()
    const userTariff = await getPublisherUserTariffPlan(db, ctx.from.id)
    db.close()
    const text = `${i18n['ru'].message.keywordGroupsMenu}

${userTariff === 'free' ? i18n['ru'].message.freeTariff : ''}`
    return {
      text,
      buttons: [[[i18n['ru'].button.back, ctx => enterToState(ctx, addKeywordsState)]]],
    }
  },
  onCallback: async (ctx: TTelegrafContext, callback: string) => {
    const [operation, groupName] = callback.split('|')
    const db = await getDbConnection()
    const keywordGroup = await selectPublisherKeywordGroupByName(db, groupName)
    if (!keywordGroup.length) throw new InfoMessage(`Unknown menu state: ${callback}`)
    logUserAction(ctx.from, {
      state: EState.KEYWORD_GROUP_SELECT,
      operation,
      group: groupName,
    })
    const keywords = keywordGroup[0].keywords.split(', ')
    if (operation === 'sub') {
      await insertPublisherGroupSubscription(db, [
        {
          groupName,
          channelId: ctx.session.channel.id,
        },
      ])
      const keywordsForInsert = keywords.map(keyword => ({ keyword }))
      await addSubscription(db, ctx.session.channel.id, keywordsForInsert)
      await ctx.reply(`Вы успешно подписались на ключевые слова из группы «${groupName}»`)
    } else if (operation === 'del') {
      await deletePublisherGroupSubscription(db, ctx.session.channel.id, groupName)
      await deleteSubscription(db, ctx.session.channel.id, keywords)
      await ctx.reply(`Вы успешно отписались от ключевых слов из группы «${groupName}»`)
    }
    await db.close()
    return
  },
}
