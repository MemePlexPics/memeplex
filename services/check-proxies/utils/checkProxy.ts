import { Logger } from 'winston'
import { getProxySpeed, checkProxyAnonimity, dateToYyyyMmDdHhMmSs } from '../../../utils'

export const checkProxy = async (
  proxy: { speed: number; ip: string; port: number; protocol: string },
  ownIp: string,
  logger: Logger,
) => {
  const anonymityLevel = await checkProxyAnonimity(ownIp, proxy.protocol, proxy.ip, proxy.port)
  const isValid = anonymityLevel !== null
  const lastCheckDatetime = dateToYyyyMmDdHhMmSs(isValid ? new Date() : new Date(0))
  const result = {
    anonymity: anonymityLevel,
    availability: isValid,
    speed: proxy.speed || null,
    lastCheckDatetime,
  }
  if (!isValid) return result

  const speed = await getProxySpeed(proxy.ip, proxy.port, proxy.protocol, 5, logger)
  // To avoid losing the last measured speed (was it good proxy or na-h)
  if (speed) result.speed = speed
  return result
}
