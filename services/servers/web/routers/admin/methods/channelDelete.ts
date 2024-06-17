import { getDbConnection } from '../../../../../../utils'
import { updateChannelAvailability } from '../../../../../../utils/mysql-queries'
import { setLogAction } from '../utils'
import type { TRequestHandler } from '../types'

export const channelDelete: TRequestHandler<{
  channel: string
}> = async (req, res) => {
  const { channel } = req.body
  if (!channel) return res.status(500).send()
  const db = await getDbConnection()
  await updateChannelAvailability(db, {
    name: channel,
    status: 'DISABLED',
  })
  await db.close()
  setLogAction(res, `🗑 ${channel}`)
  return res.send()
}
