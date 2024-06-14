import { selectExistedProxy, insertProxies } from '../../../utils/mysql-queries'
import { checkProxy } from '.'
import type { TDbConnection } from '../../../utils/types'
import type { Logger } from 'winston'
import type { proxies } from '../../../db/schema'

export const handleAddingProxy = async (
  db: TDbConnection,
  proxy: typeof proxies.$inferSelect,
  ipWithoutProxy: string,
  logger: Logger,
) => {
  const found = await selectExistedProxy(db, proxy.address, proxy.protocol)
  if (found.length === 0) {
    const result = await checkProxy(proxy, ipWithoutProxy, logger)
    await insertProxies(db, [
      {
        address: proxy.address,
        protocol: proxy.protocol,
        availability: Number(result.availability),
        anonymity: result.anonymity,
        speed: result.speed,
        lastActivityDatetime: result.lastCheckDatetime,
        lastCheckDatetime: result.lastCheckDatetime,
      },
    ])
  }
}
