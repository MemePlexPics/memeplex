import { logUserAction } from '.'
import { getDbConnection } from '../../../../../utils'
import {
  deletePublisherChannelById,
  deletePublisherGroupSubscriptionByChannelId,
  deletePublisherSubscriptionsByChannelId,
} from '../../../../../utils/mysql-queries'
import { i18n } from '../i18n'
import type { TTelegrafContext } from '../types'

export const onClickDeleteChannel = async (ctx: TTelegrafContext) => {
  if (!ctx.session.channel) {
    throw new Error(`onClickDeleteChannel: ctx.session.channel is undefined`)
  }
  const db = await getDbConnection()
  await deletePublisherSubscriptionsByChannelId(db, ctx.session.channel.id)
  await deletePublisherGroupSubscriptionByChannelId(db, ctx.session.channel.id)
  await deletePublisherChannelById(db, ctx.session.channel.id)
  await db.close()
  await ctx.reply(i18n['ru'].message.channelUnlinked())
  logUserAction(ctx, {
    error: `Unlinked`,
    ...ctx.session.channel,
  })
}
