import { getDbConnection } from '../../../../../../utils'
import { updateChannelAvailability } from '../../../../../../utils/mysql-queries'
import { setLogAction } from '../utils'
import { TRequestHandler } from '../types'

export const channelDelete: TRequestHandler<{
  channel: string
}> = async (req, res) => {
  const { channel } = req.body
  if (!channel) return res.status(500).send()
  const db = await getDbConnection()
  await updateChannelAvailability(db, {
    name: channel,
    availability: 0,
  })
  await db.close()
  setLogAction(res, `🗑 ${channel}`)
  return res.send()
}
