import { addKeywordsState, mainState } from '.'
import { EState } from '../constants'
import { TState } from '../types'
import { enterToState, logUserAction } from '../utils'
import { getDbConnection, getTgChannelName } from '../../../../../utils'
import { insertPublisherChannel } from '../../../../../utils/mysql-queries'

export const addChannelState: TState = {
  stateName: EState.ADD_CHANNEL,
  menu: async () => {
    return {
      text: 'Введитие название канала в формате @name или https://t.me/name',
      buttons: [[['⬅️ Назад', ctx => enterToState(ctx, mainState)]]],
    }
  },
  onText: async (ctx, text) => {
    const logEntity = {
      state: EState.ADD_CHANNEL,
    }
    const channel = getTgChannelName(text)
    if (!channel) {
      await ctx.reply(
        'Пожалуйста, проверьте корректность названия. Формат: @name или https://t.me/name',
      )
      logUserAction(ctx.from, {
        ...logEntity,
        error: `Incorrect channel`,
        channel: text,
      })
      return
    }
    const chat = await ctx.telegram.getChat(`@${channel}`)
    if (chat.type === 'private') {
      await ctx.reply(`
                Для того, чтобы подписаться самому, выберите в главном меню кнопку "Добавить себя".
                Вернитесь назад в главное меню или отправьте название канала.`)

      logUserAction(ctx.from, {
        ...logEntity,
        error: `Adding private channel`,
        channel,
      })
      return
    }
    const administrators = await ctx.telegram.getChatAdministrators(`@${channel}`)
    let isOurUserAnAdmin: boolean
    let isOurBotAnAdmin: boolean
    administrators.some(admin => {
      if (!isOurUserAnAdmin && admin.user.id === ctx.from.id) {
        isOurUserAnAdmin = true
      } else if (!isOurBotAnAdmin && admin.user.id === ctx.botInfo.id) {
        isOurBotAnAdmin = true
      }
      return isOurUserAnAdmin && isOurBotAnAdmin
    })
    if (!isOurUserAnAdmin) {
      await ctx.reply(`
                Добавить подписку на канал может только администратор канала.
                Если вы хотите только подписаться на мемы, то вернитесь назад в главном меню и выберите соответствующий пункт.
            `)
      logUserAction(ctx.from, {
        ...logEntity,
        error: `The user not an admin`,
        channel,
      })
      return
    }
    if (!isOurBotAnAdmin) {
      await ctx.reply(`
                Для публикации в канал @${channel} боту необходимо предоставить админ-права.
                После предоставления прав повторите, пожалуйста, отправку названия канала в том же формате.`)

      logUserAction(ctx.from, {
        ...logEntity,
        error: `Admin rights not granted`,
        channel,
      })
      return
    }
    const subscribers = await ctx.telegram.getChatMembersCount(`@${channel}`)
    if (channel) {
      ctx.session.channel = {
        id: chat.id,
        name: channel,
        type: chat.type,
      }

      const db = await getDbConnection()
      const timestamp = Date.now() / 1000
      await insertPublisherChannel(db, {
        id: chat.id,
        userId: ctx.from.id,
        username: channel,
        subscribers,
        type: chat.type,
        timestamp,
      })
      await db.close()
      logUserAction(ctx.from, {
        ...logEntity,
        info: `Added`,
        channel,
      })
      await enterToState(ctx, addKeywordsState)
      return
    }
  },
}
