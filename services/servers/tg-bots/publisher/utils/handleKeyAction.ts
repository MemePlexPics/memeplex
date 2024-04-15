import { getDbConnection } from '../../../../../utils'
import {
  deletePublisherSubscription,
  selectPublisherChannelsByUserId,
} from '../../../../../utils/mysql-queries'
import { getTelegramUser } from '../../utils'
import { TTelegrafContext } from '../types'

export const handleKeyAction = async (ctx: TTelegrafContext, command: 'del', keyword: string) => {
  if (command === 'del') {
    const db = await getDbConnection()
    const userChannels = await selectPublisherChannelsByUserId(db, ctx.from.id)
    for (const channel of userChannels) {
      await deletePublisherSubscription(db, channel.id, keyword)
    }
    await db.close()
    await ctx.reply(`Ключевое слово «${keyword}» успешно удалено.`)
    const user = getTelegramUser(ctx.from)
    global.logger.info(`Keyword unsubscribe: ${user} from the «${keyword}»`)
  }
}
