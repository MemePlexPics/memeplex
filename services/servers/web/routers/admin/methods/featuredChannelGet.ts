import { getDbConnection } from '../../../../../../utils'
import { selectFeaturedChannelByUsername } from '../../../../../../utils/mysql-queries'
import { setLogAction } from '../utils'
import { TRequestHandler } from '../types'

export const featuredChannelGet: TRequestHandler<{
  username: string
}> = async (req, res) => {
  const { username } = req.body
  if (!username) return res.status(500).send()
  const db = await getDbConnection()
  const response = await selectFeaturedChannelByUsername(db, username)
  await db.close()
  setLogAction(res, `👁‍ @${username}`)
  if (response.length === 0) {
    return res.status(204).send()
  }
  return res.send(response)
}
