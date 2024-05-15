/* global Buffer */
import process from 'process'
import amqplib, { Channel, Connection } from 'amqplib'
import { getDbConnection } from '../../utils'
import { selectExistedProxy } from '../../utils/mysql-queries'
import { AMQP_CHECK_PROXY_CHANNEL } from '../../constants'
import { getProxies } from '.'
import { Logger } from 'winston'

export const findNewProxies = async (logger: Logger) => {
  let amqp: Connection | undefined, checkProxyCh: Channel | undefined
  const proxies = await getProxies()
  logger.info(`💬 Proxy list fetched. ${proxies?.length} entities`)
  if (!proxies) return
  logger.info('💬 Starting to look for new ones')
  try {
    amqp = await amqplib.connect(process.env.AMQP_ENDPOINT)
    checkProxyCh = await amqp.createChannel()
    const db = await getDbConnection()
    let notCheckedProxiesCount = proxies.length
    if (proxies.length) {
      // TODO: get rid of the AMQP_CHECK_PROXY_CHANNEL?
      await checkProxyCh.purgeQueue(AMQP_CHECK_PROXY_CHANNEL)
    }
    for (const proxy of proxies) {
      const proxyString = `${proxy.ip}:${proxy.port}`
      const found = await selectExistedProxy(db, proxyString, proxy.protocol)
      if (found.length !== 0) {
        notCheckedProxiesCount--
        continue
      }

      const proxyData = Buffer.from(JSON.stringify({ action: 'add', proxy }))
      checkProxyCh.sendToQueue(AMQP_CHECK_PROXY_CHANNEL, proxyData, {
        persistent: true,
      })
    }
    await db.close()
    logger.info(`💬 Looking completed: ${notCheckedProxiesCount} new proxies to check`)
  } finally {
    if (checkProxyCh) await checkProxyCh.close()
    if (amqp) await amqp.close()
  }
}
