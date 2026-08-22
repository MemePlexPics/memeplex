import { getDbConnection } from '../../../../../../utils'
import {
  deleteBotPremiumUser,
  selectBotUserByUsername,
  updateTelegrafSessionPremiumUntil,
} from '../../../../../../utils/mysql-queries'
import { setLogAction, toBotUsername } from '../utils'
import type { TRequestHandler } from '../types'

export const premiumDelete: TRequestHandler<{
  username: string
}> = async (req, res) => {
  const { username } = req.body
  if (!username) return res.status(500).send()
  const db = await getDbConnection()
  const [user] = await selectBotUserByUsername(db, toBotUsername(username))
  if (!user) {
    await db.close()
    return res.status(404).send()
  }
  await deleteBotPremiumUser(db, user.id)
  await updateTelegrafSessionPremiumUntil(db, user.id, 0)
  await db.close()
  setLogAction(res, `✨ Unset premium for ${toBotUsername(username)}`)
  return res.send()
}
