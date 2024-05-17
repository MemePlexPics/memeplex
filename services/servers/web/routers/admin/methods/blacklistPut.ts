import { getDbConnection } from '../../../../../../utils'
import { updateBlackList } from '../../../../../../utils/mysql-queries'
import { TRequestHandler } from '../types'
import { setLogAction } from '../utils'

export const blacklistPut: TRequestHandler<{
  words: string
}> = async (req, res) => {
  const { words } = req.body
  if (!words) return res.status(500).send()
  const db = await getDbConnection()
  await updateBlackList(db, { words })
  await db.close()
  setLogAction(res, words)
  return res.send()
}
