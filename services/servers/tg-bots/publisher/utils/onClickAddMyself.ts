import { getDbConnection } from '../../../../../utils'
import { upsertPublisherChannel } from '../../../../../utils/mysql-queries'
import { getTelegramUser } from '../../utils'
import type { TTelegrafContext } from '../types'

export const onClickAddMyself = async (ctx: TTelegrafContext) => {
  if (!ctx.from) {
    throw new Error('There is no ctx.from')
  }
  const username = getTelegramUser(ctx.from, '')
  ctx.session.channel = {
    name: username.user,
    id: ctx.from.id,
    type: 'private',
  }
  const db = await getDbConnection()
  const timestamp = Date.now() / 1000
  await upsertPublisherChannel(db, {
    id: ctx.from.id,
    userId: ctx.from.id,
    username: username.user,
    subscribers: 0,
    type: 'private',
    timestamp,
  })
  await db.close()
}
