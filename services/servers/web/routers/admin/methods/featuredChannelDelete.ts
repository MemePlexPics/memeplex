import { getDbConnection } from '../../../../../../utils'
import { removeFeaturedChannel } from '../../../../../../utils/mysql-queries'
import { setLogAction } from '../utils'
import type { TRequestHandler } from '../types'

export const featuredChannelDelete: TRequestHandler<{
  username: string
}> = async (req, res) => {
  const { username } = req.body
  // TODO: Middleware checkParams(channel, password)
  if (!username) return res.status(500).send()
  const db = await getDbConnection()
  await removeFeaturedChannel(db, username)
  await db.close()
  setLogAction(res, `🗑 Deleted @${username}`)
  return res.send()
}
