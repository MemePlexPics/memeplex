import { Key } from 'telegram-keyboard'
import { EState } from '../constants'
import { TState } from '../types'
import { enterToState } from '../utils'
import { addChannelState, addKeywordsState, channelSelectState } from '.'
import { InfoMessage, getDbConnection } from '../../../../../utils'
import {
  countPublisherChannelsByUserId,
  insertPublisherChannel
} from '../../../../../utils/mysql-queries'
import { getTelegramUser } from '../../utils'

const ADD_MYSELF = 'add_myself'

export const mainState: TState<EState> = {
  stateName: EState.MAIN,
  inlineMenu: async (ctx) => {
    const db = await getDbConnection()
    const userChannelsCount = await countPublisherChannelsByUserId(
      db,
      ctx.from.id
    )
    const buttons = [[Key.callback('Добавить канал', EState.ADD_CHANNEL)]]
    if (userChannelsCount !== 0) {
      buttons.push([Key.callback('Настройки подписок', EState.CHANNEL_SELECT)])
    } else {
      buttons.push([Key.callback('Добавить ключевые слова', ADD_MYSELF)])
    }
    return {
      text: 'Меню подписок',
      buttons
    }
  },
  onCallback: async (ctx, state) => {
    if (state === ADD_MYSELF) {
      const username = getTelegramUser(ctx.from, '')
      ctx.session.channel = {
        name: username.user,
        id: ctx.from.id,
        type: 'private'
      }
      const db = await getDbConnection()
      const timestamp = Date.now() / 1000
      await insertPublisherChannel(db, {
        id: ctx.from.id,
        userId: ctx.from.id,
        username: username.user,
        subscribers: 0,
        timestamp
      })
      await enterToState(ctx, addKeywordsState)
    }
    if (state === EState.ADD_CHANNEL) {
      await enterToState(ctx, addChannelState)
      return
    }
    if (state === EState.CHANNEL_SELECT) {
      await enterToState(ctx, channelSelectState)
      return
    }
    throw new InfoMessage(`Unknown menu state: ${state}`)
  }
}
