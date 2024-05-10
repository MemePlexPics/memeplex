import { Chat } from 'telegraf/typings/core/types/typegram'
import { enterToState, logUserAction } from '.'
import { getDbConnection, logInfo } from '../../../../../utils'
import { EState } from '../constants'
import { insertPublisherChannel } from '../../../../../utils/mysql-queries'
import { addKeywordsState } from '../states'
import { i18n } from '../i18n'
import { TTelegrafContext } from '../types'

export const addChannel = async (ctx: TTelegrafContext, channelId: number) => {
  if (!ctx.from) {
    throw new Error('There is no ctx.from')
  }
  const logEntity = {
    state: EState.MAIN,
  }
  // const channel = getTgChannelName(text)
  // if (!channel) {
  //   await ctx.reply(i18n['ru'].message.checkChannelNameFormat())
  //   logUserAction(ctx.from, {
  //     ...logEntity,
  //     error: `Incorrect channel`,
  //     channel: text,
  //   })
  //   return
  // }
  const readyButton = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '✅ Готово',
            callback_data: `${channelId}`,
          },
        ],
      ],
    },
  }
  let chat: Chat.ChannelGetChat | undefined
  try {
    const result = await ctx.telegram.getChat(channelId)
    if ('title' in result && 'accent_color_id' in result) chat = result
  } catch (error) {
    await ctx.reply(i18n['ru'].message.checkChannelName())
    return
  }
  // if (chat?.type === 'private') {
  //   await ctx.reply(i18n['ru'].message.addedUserInsteadOfChannel())

  //   logUserAction(ctx.from, {
  //     ...logEntity,
  //     error: `Adding a private channel`,
  //     channel: chat.username ?? chat.id,
  //   })
  //   return
  // }
  let isOurUserAnAdmin: true | undefined
  let isOurBotAnAdmin: true | undefined
  try {
    const administrators = await ctx.telegram.getChatAdministrators(channelId)
    administrators.some(admin => {
      if (!isOurUserAnAdmin && admin.user.id === ctx.from?.id) {
        isOurUserAnAdmin = true
      } else if (!isOurBotAnAdmin && admin.user.id === ctx.botInfo.id) {
        isOurBotAnAdmin = true
      }
      return isOurUserAnAdmin && isOurBotAnAdmin
    })
  } catch (error) {
    await ctx.reply(i18n['ru'].message.botMustBeInTheChannelAndHaveAdminRights(), readyButton)
    if (error instanceof Error) await logInfo(ctx.logger, error)
    return
  }
  if (!isOurUserAnAdmin) {
    await ctx.reply(i18n['ru'].message.onlyAdminCanSubscribeChannel())
    logUserAction(ctx.from, {
      ...logEntity,
      error: `The user not an admin`,
      channel: chat?.username ?? channelId,
    })
    return
  }
  if (!isOurBotAnAdmin) {
    await ctx.reply(i18n['ru'].message.botMustHaveAdminRights(), readyButton)
    logUserAction(ctx.from, {
      ...logEntity,
      error: `Admin rights not granted`,
      channel: chat?.username ?? channelId,
    })
    return
  }
  const subscribers = await ctx.telegram.getChatMembersCount(channelId)
  if (chat) {
    ctx.session.channel = {
      id: channelId,
      name: chat.username ?? chat.title,
      type: chat.type,
    }

    const db = await getDbConnection()
    const timestamp = Date.now() / 1000
    await insertPublisherChannel(db, {
      id: chat.id,
      userId: ctx.from.id,
      username: chat.username ?? chat.title,
      subscribers,
      type: chat.type,
      timestamp,
    })
    await db.close()
    logUserAction(ctx.from, {
      ...logEntity,
      info: `Added`,
      channel: chat.username ?? chat.id,
    })
    await enterToState(ctx, addKeywordsState)
    return
  }
}
