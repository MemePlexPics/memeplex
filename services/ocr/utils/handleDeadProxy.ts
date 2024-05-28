import type { AxiosResponse } from 'axios'
import { InfoMessage, getMysqlClient } from '../../../utils'
import { updateProxyAvailability } from '../../../utils/mysql-queries'

export const handleDeadProxy = async (
  res: AxiosResponse['data'],
  proxy?: string,
  protocol?: string,
) => {
  if (proxy && !Array.isArray(res?.ParsedResults)) {
    const mysql = await getMysqlClient()
    await updateProxyAvailability(mysql, proxy, protocol, false)
    await mysql.end()
    throw new InfoMessage(
      `Invalid res.ParsedResults, probably dead proxy ${proxy} (${protocol}). ${JSON.stringify(res)}`,
    )
  }
}
