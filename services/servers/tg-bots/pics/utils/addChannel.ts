import type { Chat } from 'telegraf/typings/core/types/typegram'
import { enterToState, logUserAction, onClickDeleteChannel } from '.'
import { getDbConnection, getTgChannelName, logInfo } from '../../../../../utils'
import { selectBotChannelById, upsertBotChannel } from '../../../../../utils/mysql-queries'
import { channelSettingState } from '../states'
import { getTranslation } from '../i18n'
import type { TTelegrafContext } from '../types'

export const addChannel = async (ctx: TTelegrafContext, text: string) => {
  const channel = getTgChannelName(text)
  if (!channel) {
    await ctx.reply(getTranslation(ctx.from.language_code).message.checkChannelNameFormat())
    await logUserAction(ctx, {
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
            text: getTranslation(ctx.from.language_code).button.ready(),
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
      await ctx.reply(getTranslation(ctx.from.language_code).message.addedUserInsteadOfChannel())

      await logUserAction(ctx, {
        error: `Adding a private channel`,
        channel,
      })
      return
    }
  } catch (error) {
    await ctx.reply(getTranslation(ctx.from.language_code).message.checkChannelName())
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
    await ctx.reply(
      getTranslation(ctx.from.language_code).message.botMustBeInTheChannelAndHaveAdminRights(),
      readyButton,
    )
    if (error instanceof Error) await logInfo(ctx.logger, error)
    return
  }
  if (!isOurUserAnAdmin) {
    await ctx.reply(getTranslation(ctx.from.language_code).message.onlyAdminCanSubscribeChannel())
    await logUserAction(ctx, {
      error: `The user not an admin`,
      channel,
    })
    return
  }
  if (!isOurBotAnAdmin) {
    await ctx.reply(
      getTranslation(ctx.from.language_code).message.botMustHaveAdminRights(),
      readyButton,
    )
    await logUserAction(ctx, {
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
    const [channelInDb] = await selectBotChannelById(db, chat.id)
    if (channelInDb && channelInDb.userId === ctx.from.id) {
      await ctx.reply(getTranslation(ctx.from.language_code).message.channelAlredyAdded())
      return
    }
    await onClickDeleteChannel(ctx)
    const timestamp = Date.now() / 1000
    await upsertBotChannel(db, {
      id: chat.id,
      userId: ctx.from.id,
      username: channel,
      subscribers,
      type: chat.type,
      timestamp,
    })
    await db.close()
    await ctx.reply(getTranslation(ctx.from.language_code).message.addedChannel(channel))
    await logUserAction(ctx, {
      info: `Added`,
      channel,
    })
    await enterToState(ctx, channelSettingState)
    return
  }
}
