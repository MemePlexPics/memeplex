import type { Logger } from 'winston'
import { getProxySpeed, checkProxyAnonimity, dateToYyyyMmDdHhMmSs } from '../../../utils'
import type { proxies } from '../../../db/schema'

export const checkProxy = async (
  proxy: typeof proxies.$inferSelect,
  ownIp: string,
  logger: Logger,
) => {
  const [ip, port] = proxy.address.split(':')
  const anonymityLevel = await checkProxyAnonimity(ownIp, proxy.protocol, ip, Number(port))
  const isValid = anonymityLevel !== null
  const lastCheckDatetime = dateToYyyyMmDdHhMmSs(isValid ? new Date() : new Date(0))
  const result: {
    anonymity: 'transparent' | 'anonymous' | 'elite' | null
    availability: boolean
    speed: number | null
    lastCheckDatetime: string
  } = {
    anonymity: anonymityLevel,
    availability: isValid,
    speed: proxy.speed || null,
    lastCheckDatetime,
  }
  if (!isValid) return result

  const speed = await getProxySpeed(ip, Number(port), proxy.protocol, 5, logger)
  // To avoid losing the last measured speed (was it good proxy or na-h)
  if (speed) result.speed = speed
  return result
}
