import { getDbConnection } from '../../../../../../utils'
import { proceedChannelSuggestion } from '../../../../../../utils/mysql-queries'
import { setLogAction } from '../utils'
import type { TRequestHandler } from '../types'

export const channelSuggestionProceedPost: TRequestHandler<{
  channel: string
}> = async (req, res) => {
  const { channel } = req.body
  if (!channel) return res.status(500).send()
  const db = await getDbConnection()
  await proceedChannelSuggestion(db, channel)
  await db.close()
  setLogAction(res, `@${channel}`)
  return res.send()
}
