import { selectExistedProxy, insertProxies } from '../../../utils/mysql-queries'
import { checkProxy } from '.'
import type { TDbConnection } from '../../../utils/types'
import type { Logger } from 'winston'

export const handleAddingProxy = async (
  db: TDbConnection,
  proxy: { speed: number; ip: string; port: number; protocol: string },
  ipWithoutProxy: string,
  logger: Logger,
) => {
  const proxyString = `${proxy.ip}:${proxy.port}`
  const found = await selectExistedProxy(db, proxyString, proxy.protocol)
  if (found.length === 0) {
    const result = await checkProxy(proxy, ipWithoutProxy, logger)
    await insertProxies(db, [
      {
        address: `${proxy.ip}:${proxy.port}`,
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
