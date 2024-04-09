import { EState } from '../constants'
import { TMenuButton, TState } from '../types'
import { enterToState, onClickDeleteChannel } from '../utils'
import { addKeywordsState, keywordSettingsState, mainState } from '.'
import { getDbConnection } from '../../../../../utils'
import { countPublisherSubscriptionsByChannelId } from '../../../../../utils/mysql-queries'

export const channelSettingState: TState = {
  stateName: EState.CHANNEL_SETTINGS,
  menu: async ctx => {
    const db = await getDbConnection()
    const keywordsCount = await countPublisherSubscriptionsByChannelId(db, ctx.session.channel.id)
    await db.close()
    const hasKeywords = keywordsCount !== 0
    const buttons: TMenuButton[][] = [
      [['➕ Добавить ключевые слова', ctx => enterToState(ctx, addKeywordsState)]],
      [
        [
          '🗑 Отвязать канал',
          async ctx => {
            await onClickDeleteChannel(ctx)
            ctx.session.channel = undefined
            await enterToState(ctx, mainState)
          },
        ],
      ],
      [
        [
          '🏠 В главное меню',
          async ctx => {
            ctx.session.channel = undefined
            await enterToState(ctx, mainState)
          },
        ],
      ],
    ]
    if (hasKeywords)
      buttons.splice(1, 0, [
        ['✏️ Редактировать ключевые слова', ctx => enterToState(ctx, keywordSettingsState)],
      ])
    return {
      text: `Настройка подписки ${ctx.session.channel.name}`,
      buttons,
    }
  },
}
