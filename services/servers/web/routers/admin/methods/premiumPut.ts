import { getDbConnection } from '../../../../../../utils'
import {
  selectBotUserByUsername,
  updateTelegrafSessionPremiumUntil,
  upsertBotPremiumUser,
} from '../../../../../../utils/mysql-queries'
import { setLogAction, toBotUsername } from '../utils'
import type { TRequestHandler } from '../types'

export const premiumPut: TRequestHandler<{
  username: string
  untilDate: string
}> = async (req, res) => {
  const { username, untilDate } = req.body
  if (!username || !untilDate) return res.status(500).send()
  if (!/^\d\d\d\d-\d\d-\d\d$/.test(untilDate)) return res.status(500).send()
  const untilTimestamp = Number(new Date(untilDate)) / 1000
  const db = await getDbConnection()
  const [user] = await selectBotUserByUsername(db, toBotUsername(username))
  if (!user) {
    await db.close()
    return res.status(404).send()
  }
  await upsertBotPremiumUser(db, {
    userId: user.id,
    untilTimestamp,
  })
  await updateTelegrafSessionPremiumUntil(db, user.id, untilTimestamp)
  await db.close()
  setLogAction(res, `✨ Set premium for ${toBotUsername(username)} until ${untilDate}`)
  return res.send()
}
