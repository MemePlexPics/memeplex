import { logUserAction } from '.'
import { getDbConnection } from '../../../../../utils'
import {
  deletePublisherChannelById,
  deletePublisherSubscriptionsByChannelId,
} from '../../../../../utils/mysql-queries'
import { EState } from '../constants'
import { i18n } from '../i18n'
import { TTelegrafContext } from '../types'

export const onClickDeleteChannel = async (ctx: TTelegrafContext) => {
  const db = await getDbConnection()
  await deletePublisherSubscriptionsByChannelId(db, ctx.session.channel.id)
  await deletePublisherChannelById(db, ctx.session.channel.id)
  await db.close()
  await ctx.reply(i18n['ru'].message.channelUnlinked)
  logUserAction(ctx.from, {
    state: EState.CHANNEL_SETTINGS,
    error: `Unlinked`,
    ...ctx.session.channel,
  })
}
