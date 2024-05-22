import { Chat } from 'telegraf/typings/core/types/typegram'
import { enterToState, logUserAction } from '.'
import { getDbConnection, getTgChannelName, logInfo } from '../../../../../utils'
import { upsertPublisherChannel } from '../../../../../utils/mysql-queries'
import { channelSettingState } from '../states'
import { i18n } from '../i18n'
import { TTelegrafContext } from '../types'

export const addChannel = async (ctx: TTelegrafContext, text: string) => {
  if (!ctx.from) {
    throw new Error('There is no ctx.from')
  }
  const channel = getTgChannelName(text)
  if (!channel) {
    await ctx.reply(i18n['ru'].message.checkChannelNameFormat())
    logUserAction(ctx, {
      error: `Incorrect channel link`,
      channel: text,
    })
    return
  }
  const readyButton = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: i18n['ru'].button.ready(),
            callback_data: channel,
          },
        ],
      ],
    },
  }
  let chat: Chat.ChannelGetChat | undefined
  try {
    const result = await ctx.telegram.getChat(`@${channel}`)
    if ('title' in result && 'accent_color_id' in result) {
      chat = result
    } else {
      await ctx.reply(i18n['ru'].message.addedUserInsteadOfChannel())

      logUserAction(ctx, {
        error: `Adding a private channel`,
        channel,
      })
      return
    }
  } catch (error) {
    await ctx.reply(i18n['ru'].message.checkChannelName())
    return
  }
  let isOurUserAnAdmin: true | undefined
  let isOurBotAnAdmin: true | undefined
  try {
    const administrators = await ctx.telegram.getChatAdministrators(`@${channel}`)
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
    logUserAction(ctx, {
      error: `The user not an admin`,
      channel,
    })
    return
  }
  if (!isOurBotAnAdmin) {
    await ctx.reply(i18n['ru'].message.botMustHaveAdminRights(), readyButton)
    logUserAction(ctx, {
      error: `Admin rights not granted`,
      channel,
    })
    return
  }
  const subscribers = await ctx.telegram.getChatMembersCount(`@${channel}`)
  if (chat) {
    ctx.session.channel = {
      id: chat.id,
      name: channel,
      type: chat.type,
    }

    const db = await getDbConnection()
    const timestamp = Date.now() / 1000
    await upsertPublisherChannel(db, {
      id: chat.id,
      userId: ctx.from.id,
      username: channel,
      subscribers,
      type: chat.type,
      timestamp,
    })
    await db.close()
    logUserAction(ctx, {
      info: `Added`,
      channel,
    })
    await enterToState(ctx, channelSettingState)
    return
  }
}
