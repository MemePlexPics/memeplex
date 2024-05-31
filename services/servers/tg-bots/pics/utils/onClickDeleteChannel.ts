import { logUserAction } from '.'
import { getDbConnection } from '../../../../../utils'
import {
  deleteBotChannelById,
  deleteBotTopicSubscriptionByChannelId,
  deleteBotSubscriptionsByChannelId,
  deleteBotTopicKeywordUnsubscriptionByChannelId,
} from '../../../../../utils/mysql-queries'
import { i18n } from '../i18n'
import type { TTelegrafContext } from '../types'

export const onClickDeleteChannel = async (ctx: TTelegrafContext) => {
  if (!ctx.session.channel) {
    throw new Error(`onClickDeleteChannel: ctx.session.channel is undefined`)
  }
  const db = await getDbConnection()
  await deleteBotSubscriptionsByChannelId(db, ctx.session.channel.id)
  await deleteBotTopicSubscriptionByChannelId(db, ctx.session.channel.id)
  await deleteBotTopicKeywordUnsubscriptionByChannelId(db, ctx.session.channel.id)
  await deleteBotChannelById(db, ctx.session.channel.id)
  await db.close()
  await ctx.reply(i18n['ru'].message.channelUnlinked())
  await logUserAction(ctx, {
    error: `Unlinked`,
    ...ctx.session.channel,
  })
}
