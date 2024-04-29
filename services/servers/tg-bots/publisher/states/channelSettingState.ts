import { EState } from '../constants'
import { TMenuButton, TState } from '../types'
import { enterToState, onClickDeleteChannel } from '../utils'
import { addKeywordsState, keywordSettingsState, mainState } from '.'
import { getDbConnection } from '../../../../../utils'
import { countPublisherSubscriptionsByChannelId } from '../../../../../utils/mysql-queries'
import { i18n } from '../i18n'

export const channelSettingState: TState = {
  stateName: EState.CHANNEL_SETTINGS,
  menu: async ctx => {
    const db = await getDbConnection()
    const keywordsCount = await countPublisherSubscriptionsByChannelId(db, ctx.session.channel.id)
    await db.close()
    const hasKeywords = keywordsCount !== 0
    const buttons: TMenuButton[][] = [
      [[i18n['ru'].button.addKeywords, ctx => enterToState(ctx, addKeywordsState)]],
      [
        [
          i18n['ru'].button.unlinkChannel,
          async ctx => {
            await onClickDeleteChannel(ctx)
            ctx.session.channel = undefined
            await enterToState(ctx, mainState)
          },
        ],
      ],
      [
        [
          i18n['ru'].button.toMainMenu,
          async ctx => {
            ctx.session.channel = undefined
            await enterToState(ctx, mainState)
          },
        ],
      ],
    ]
    if (hasKeywords)
      buttons.splice(1, 0, [
        [i18n['ru'].button.editKeywords, ctx => enterToState(ctx, keywordSettingsState)],
      ])
    return {
      text: `Настройка подписки ${ctx.session.channel.name}`,
      buttons,
    }
  },
}
