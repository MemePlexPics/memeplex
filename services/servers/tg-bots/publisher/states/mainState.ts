import { EState } from '../constants'
import { TMenuButton, TState } from '../types'
import { enterToState, onClickAddMyself } from '../utils'
import { addChannelState, addKeywordsState, channelSelectState } from '.'
import { getDbConnection } from '../../../../../utils'
import { countPublisherChannelsByUserId } from '../../../../../utils/mysql-queries'

export const mainState: TState = {
  stateName: EState.MAIN,
  menu: async ctx => {
    const db = await getDbConnection()
    const userChannelsCount = await countPublisherChannelsByUserId(db, ctx.from.id)
    await db.close()
    const buttons: TMenuButton[][] = [
      [['Привязать канал', () => enterToState(ctx, addChannelState)]],
    ]
    if (userChannelsCount !== 0) {
      buttons.push([['Настройки подписок', () => enterToState(ctx, channelSelectState)]])
    } else {
      buttons.push([
        [
          'Добавить ключевые слова',
          async () => {
            await onClickAddMyself(ctx)
            await enterToState(ctx, addKeywordsState)
          },
        ],
      ])
    }
    return {
      text: 'Меню подписок',
      buttons,
    }
  },
}
