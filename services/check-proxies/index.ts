import 'dotenv/config'
import amqplib, { Channel, Connection, GetMessage } from 'amqplib'
import process from 'process'
import {
  AMQP_CHECK_PROXY_CHANNEL,
  EMPTY_QUEUE_RETRY_DELAY,
} from '../../constants'
import { delay, getMysqlClient } from '../../utils'
import { handleAddingProxy, maintaneProxies } from './utils'
import { Logger } from 'winston'
import { getAmqpQueue } from '../utils'

export const checkProxies = async (logger: Logger) => {
  let amqp: Connection, checkProxyCh: Channel, checkProxyChClearTimeout: () => void
  try {
    amqp = await amqplib.connect(process.env.AMQP_ENDPOINT)
    checkProxyCh = await amqp.createChannel()
    let checkProxyChTimeout: (ms: number, logger: Logger, msg: GetMessage) => void
    [checkProxyCh, checkProxyChTimeout, checkProxyChClearTimeout] =
    await getAmqpQueue(amqp, AMQP_CHECK_PROXY_CHANNEL)

    const ipWithoutProxyResponse = await fetch('https://api64.ipify.org')
    const ipWithoutProxy = await ipWithoutProxyResponse.text()

    for (;;) {
      const mysql = await getMysqlClient()
      await maintaneProxies(mysql, ipWithoutProxy, logger)
      await mysql.end()
      const msg = await checkProxyCh.get(AMQP_CHECK_PROXY_CHANNEL)
      if (!msg) {
        await delay(EMPTY_QUEUE_RETRY_DELAY)
        continue
      }
      checkProxyChTimeout(600_000, logger, msg)

      const { action, ...payload } = JSON.parse(msg.content.toString())

      if (action === 'add') {
        const { proxy } = payload
        const mysql = await getMysqlClient()
        await handleAddingProxy(mysql, proxy, ipWithoutProxy, logger)
        await mysql.end()
      }
      checkProxyCh.ack(msg)
    }
  } finally {
    checkProxyChClearTimeout()
    if (checkProxyCh) await checkProxyCh.close()
    if (amqp) await amqp.close()
  }
}
