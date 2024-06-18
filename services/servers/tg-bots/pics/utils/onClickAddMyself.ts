import { getDbConnection } from '../../../../../utils'
import { upsertBotChannel } from '../../../../../utils/mysql-queries'
import { getTelegramUser } from '../../utils'
import type { TTelegrafContext } from '../types'

export const onClickAddMyself = async (ctx: TTelegrafContext) => {
  const username = getTelegramUser(ctx.from, '')
  ctx.session.channel = {
    name: username.user,
    id: ctx.from.id,
    type: 'private',
  }
  const db = await getDbConnection()
  const timestamp = Date.now() / 1000
  await upsertBotChannel(db, {
    id: ctx.from.id,
    userId: ctx.from.id,
    username: username.user,
    subscribers: 0,
    type: 'private',
    timestamp,
  })
  await db.close()
}
