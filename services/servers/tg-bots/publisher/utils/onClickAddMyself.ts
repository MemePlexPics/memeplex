import { logUserAction } from '.'
import { getDbConnection } from '../../../../../utils'
import { insertPublisherChannel } from '../../../../../utils/mysql-queries'
import { getTelegramUser } from '../../utils'
import { EState } from '../constants'
import { TTelegrafContext } from '../types'

export const onClickAddMyself = async (ctx: TTelegrafContext) => {
  const username = getTelegramUser(ctx.from, '')
  ctx.session.channel = {
    name: username.user,
    id: ctx.from.id,
    type: 'private',
  }
  const db = await getDbConnection()
  const timestamp = Date.now() / 1000
  await insertPublisherChannel(db, {
    id: ctx.from.id,
    userId: ctx.from.id,
    username: username.user,
    subscribers: 0,
    timestamp,
  })
  await db.close()
  logUserAction(ctx.from, {
    state: EState.MAIN,
    info: `Added himself`,
  })
}
