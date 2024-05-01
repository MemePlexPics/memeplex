import { ChatFromGetChat } from 'telegraf/typings/core/types/typegram'
import { enterToState, logUserAction } from '.'
import { getDbConnection, getTgChannelName, logInfo } from '../../../../../utils'
import { EState } from '../constants'
import { insertPublisherChannel } from '../../../../../utils/mysql-queries'
import { addKeywordsState } from '../states'
import { i18n } from '../i18n'

export const addChannel = async (ctx, text) => {
  const logEntity = {
    state: EState.ADD_CHANNEL,
  }
  const channel = getTgChannelName(text)
  if (!channel) {
    await ctx.reply(i18n['ru'].message.checkChannelNameFormat())
    logUserAction(ctx.from, {
      ...logEntity,
      error: `Incorrect channel`,
      channel: text,
    })
    return
  }
  const readyButton = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '✅ Готово',
            callback_data: channel,
          },
        ],
      ],
    },
  }
  let chat: ChatFromGetChat
  try {
    chat = await ctx.telegram.getChat(`@${channel}`)
  } catch (error) {
    await ctx.reply(i18n['ru'].message.checkChannelName())
    return
  }
  if (chat.type === 'private') {
    await ctx.reply(i18n['ru'].message.addedUserInsteadOfChannel())

    logUserAction(ctx.from, {
      ...logEntity,
      error: `Adding a private channel`,
      channel,
    })
    return
  }
  let isOurUserAnAdmin: boolean
  let isOurBotAnAdmin: boolean
  try {
    const administrators = await ctx.telegram.getChatAdministrators(`@${channel}`)
    administrators.some(admin => {
      if (!isOurUserAnAdmin && admin.user.id === ctx.from.id) {
        isOurUserAnAdmin = true
      } else if (!isOurBotAnAdmin && admin.user.id === ctx.botInfo.id) {
        isOurBotAnAdmin = true
      }
      return isOurUserAnAdmin && isOurBotAnAdmin
    })
  } catch (error) {
    await ctx.reply(i18n['ru'].message.botMustBeInTheChannelAndHaveAdminRights(), readyButton)
    await logInfo(global.logger, error)
    return
  }
  if (!isOurUserAnAdmin) {
    await ctx.reply(i18n['ru'].message.onlyAdminCanSubscribeChannel())
    logUserAction(ctx.from, {
      ...logEntity,
      error: `The user not an admin`,
      channel,
    })
    return
  }
  if (!isOurBotAnAdmin) {
    await ctx.reply(i18n['ru'].message.botMustHaveAdminRights(), readyButton)
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
}
