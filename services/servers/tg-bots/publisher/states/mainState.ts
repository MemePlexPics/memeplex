import { Key } from 'telegram-keyboard'
import { EState } from '../constants'
import { TMenuButton, TState } from '../types'
import { enterToState, onClickAddMyself } from '../utils'
import { addChannelState, addKeywordsState, channelSelectState } from '.'
import { InfoMessage, getDbConnection } from '../../../../../utils'
import {
  countPublisherChannelsByUserId,
} from '../../../../../utils/mysql-queries'

const ADD_MYSELF = 'add_myself'

export const mainState: TState<EState> = {
  stateName: EState.MAIN,
  menu: async (ctx) => {
    const db = await getDbConnection()
    const userChannelsCount = await countPublisherChannelsByUserId(db, ctx.from.id)
    await db.close()
    const buttons: TMenuButton[][] = [[['Добавить канал', () => enterToState(ctx, addChannelState)]]]
    if (userChannelsCount !== 0) {
      buttons.push([['Настройки подписок', () => enterToState(ctx, channelSelectState)]])
    } else {
      buttons.push([['Добавить ключевые слова', async () => {
        await onClickAddMyself(ctx)
        await enterToState(ctx, addKeywordsState)
      }]])
    }
    return buttons
  },
  // inlineMenu: async ctx => {
  //   const db = await getDbConnection()
  //   const userChannelsCount = await countPublisherChannelsByUserId(db, ctx.from.id)
  //   await db.close()
  //   const buttons = [[Key.callback('Добавить канал', EState.ADD_CHANNEL)]]
  //   if (userChannelsCount !== 0) {
  //     buttons.push([Key.callback('Настройки подписок', EState.CHANNEL_SELECT)])
  //   } else {
  //     buttons.push([Key.callback('Добавить ключевые слова', ADD_MYSELF)])
  //   }
  //   return {
  //     text: 'Меню подписок',
  //     buttons,
  //   }
  // },
  // onCallback: async (ctx, state) => {
  //   if (state === ADD_MYSELF) {
  //     await onClickAddMyself(ctx)
  //     await enterToState(ctx, addKeywordsState)
  //     return
  //   }
  //   if (state === EState.ADD_CHANNEL) {
  //     await enterToState(ctx, addChannelState)
  //     return
  //   }
  //   if (state === EState.CHANNEL_SELECT) {
  //     await enterToState(ctx, channelSelectState)
  //     return
  //   }
  //   throw new InfoMessage(`Unknown menu state: ${state}`)
  // },
}
