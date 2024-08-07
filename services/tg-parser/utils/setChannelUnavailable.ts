import 'dotenv/config'
import { getDbConnection } from '../../../utils'
import { updateChannelAvailability } from '../../../utils/mysql-queries'

export const setChannelUnavailable = async (name: string) => {
  const db = await getDbConnection()
  await updateChannelAvailability(db, {
    name,
    status: 'NOT_AVAILABLE',
  })
  await db.close()
}
