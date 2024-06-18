import type { AxiosResponse } from 'axios'
import { InfoMessage, getDbConnection } from '../../../utils'
import { updateProxyAvailability } from '../../../utils/mysql-queries'

export const handleDeadProxy = async (
  res: AxiosResponse['data'],
  proxy: `${string}:${number}`,
  protocol: string,
): Promise<void> => {
  if (!Array.isArray(res?.ParsedResults)) {
    const db = await getDbConnection()
    await updateProxyAvailability(db, proxy, protocol, 0)
    await db.close()
    throw new InfoMessage(
      `Invalid res.ParsedResults, probably dead proxy ${proxy} (${protocol}). ${JSON.stringify(res)}`,
    )
  }
}
