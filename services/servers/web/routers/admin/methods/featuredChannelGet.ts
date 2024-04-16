import { getMysqlClient } from '../../../../../../utils'
import { getFeaturedChannel } from '../../../../../../utils/mysql-queries'
import { setLogAction } from '../utils'
import { TRequestHandler } from '../types'

export const featuredChannelGet: TRequestHandler<{
  username: string
}> = async (req, res) => {
  const { username } = req.body
  if (!username) return res.status(500).send()
  const mysql = await getMysqlClient()
  const response = await getFeaturedChannel(mysql, username)
  await mysql.end()
  setLogAction(res, `👁‍ @${username}`)
  return res.send(response)
}
