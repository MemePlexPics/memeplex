import { Key } from 'telegram-keyboard'
import { EState } from '../constants'
import { TState, TTelegrafContext } from '../types'
import { enterToState } from '../utils'
import { addChannelState, channelSettingState } from '.'
import { InfoMessage, getDbConnection } from '../../../../../utils'
import { selectPublisherChannelsByUserId } from '../../../../../utils/mysql-queries'
import { ChatFromGetChat } from 'telegraf/typings/core/types/typegram'

export const channelSelectState: TState = {
  stateName: EState.CHANNEL_SELECT,
  inlineMenu: async ctx => {
    const db = await getDbConnection()
    const userChannels = await selectPublisherChannelsByUserId(db, ctx.from.id)
    await db.close()
    return {
      text: 'Выберите канал',
      buttons: userChannels
        .map(({ id, username, type }) => [Key.callback(username, `${id}|${username}|${type}`)])
        .concat([[Key.callback('➕ Добавить канал', EState.ADD_CHANNEL)]]),
    }
  },
  onCallback: async <EState>(ctx: TTelegrafContext, callback: EState | string) => {
    if (callback === EState.ADD_CHANNEL) {
      await enterToState(ctx, addChannelState)
      return
    }
    if (typeof callback === 'string') {
      const [id, username, type] = callback.split('|')
      ctx.session.channel = {
        id: Number(id),
        name: username,
        type: type as ChatFromGetChat['type'],
      }
      await enterToState(ctx, channelSettingState)
      return
    }
    throw new InfoMessage(`Unknown menu state: ${callback}`)
  },
}
