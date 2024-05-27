import 'dotenv/config'
import type { Channel, Connection, GetMessage } from 'amqplib'
import amqplib from 'amqplib'
import process from 'process'
import { AMQP_CHECK_PROXY_CHANNEL, EMPTY_QUEUE_RETRY_DELAY } from '../../constants'
import { delay, getDbConnection, getMysqlClient } from '../../utils'
import { handleAddingProxy, maintaneProxies } from './utils'
import type { Logger } from 'winston'
import { getAmqpQueue } from '../utils'

export const checkProxies = async (logger: Logger) => {
  let amqp: Connection | undefined,
    checkProxyCh: Channel | undefined,
    checkProxyChClearTimeout: (() => void) | undefined
  try {
    amqp = await amqplib.connect(process.env.AMQP_ENDPOINT)
    checkProxyCh = await amqp.createChannel()
    let checkProxyChTimeout: (ms: number, logger: Logger, msg: GetMessage) => void
    ;[checkProxyCh, checkProxyChTimeout, checkProxyChClearTimeout] = await getAmqpQueue(
      amqp,
      AMQP_CHECK_PROXY_CHANNEL,
    )

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
        const db = await getDbConnection()
        await handleAddingProxy(db, proxy, ipWithoutProxy, logger)
        await db.close()
      }
      checkProxyCh.ack(msg)
    }
  } finally {
    if (checkProxyChClearTimeout) checkProxyChClearTimeout()
    if (checkProxyCh) await checkProxyCh.close()
    if (amqp) await amqp.close()
  }
}
