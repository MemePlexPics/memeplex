import { getDbConnection } from '../../../../../utils'
import { upsertBotChannel } from '../../../../../utils/mysql-queries'
import { getTelegramUser } from '../../utils'
import type { TTelegrafContext } from '../types'

export const onClickAddMyself = async (ctx: TTelegrafContext) => {
  const username = getTelegramUser(ctx.from, '')
  const db = await getDbConnection()
  const timestamp = Date.now() / 1000
  const [channelInDb] = await upsertBotChannel(db, {
    telegramId: ctx.from.id,
    userId: ctx.from.id,
    username: username.user,
    subscribers: 0,
    type: 'private',
    timestamp,
  })
  await db.close()
  ctx.session.channel = {
    id: channelInDb.insertId,
    name: username.user,
    telegramId: ctx.from.id,
    type: 'private',
  }
}
