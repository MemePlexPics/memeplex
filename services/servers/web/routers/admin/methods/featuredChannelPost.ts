import { getDbConnection } from '../../../../../../utils'
import { upsertFeaturedChannel } from '../../../../../../utils/mysql-queries'
import { setLogAction } from '../utils'
import type { TRequestHandler } from '../types'

export const featuredChannelPost: TRequestHandler<{
  username: string
  title: string
  comment: string
  timestamp: number
}> = async (req, res) => {
  const { username, title, comment, timestamp } = req.body
  if (!username || !title) return res.status(500).send()
  const db = await getDbConnection()
  const response = await upsertFeaturedChannel(db, {
    username,
    title,
    comment,
    timestamp,
  })
  await db.close()
  // TODO: test affectedRows
  if (!response) throw new Error(`Featured channel @${username} wasn't added`)
  setLogAction(res, `➕ Added featured channel @${username}`)
  return res.send()
}
