import { checkProxy } from '../utils'
import { updateProxy } from '../../../utils/mysql-queries'
import type { Logger } from 'winston'
import type { TDbConnection } from '../../../utils/types'
import type { proxies } from '../../../db/schema'

export const checkProxyArray = async (
  db: TDbConnection,
  proxiesToCheck: (typeof proxies.$inferSelect)[],
  ipWithoutProxy: string,
  logger: Logger,
) => {
  for (const proxy of proxiesToCheck) {
    const result = await checkProxy(proxy, ipWithoutProxy, logger)
    await updateProxy(db, {
      address: proxy.address,
      protocol: proxy.protocol,
      availability: Number(result.availability),
      anonymity: result.anonymity,
      speed: result.speed,
      lastCheckDatetime: result.lastCheckDatetime,
    })
  }
}
