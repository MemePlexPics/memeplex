import 'dotenv/config'
import { Client } from '@elastic/elasticsearch'
import mysql from 'mysql2/promise'
import process from 'process'
import { promises as fs } from 'fs'

import { InfoMessage } from './custom-errors'
import { Logger } from 'winston'

export { InfoMessage } from './custom-errors'
export { getTgChannelName } from './getTgChannelName'
export { downloadFile } from './downloadFile'
export { shuffleArray } from './shuffleArray'
export { getProxySpeed } from './getProxySpeed'
export { insertProxyToRequest } from './insertProxyToRequest'
export { checkProxyAnonimity } from './checkProxyAnonimity'
export { getDbConnection } from './getDbConnection'

// TODO: split into files?
export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const getMysqlClient = async (options?: { connectTimeout: number }) => {
  const client = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectTimeout: options?.connectTimeout || 10_000
  })

  return client
}

export const getElasticClient = async () => {
  const client = new Client({
    node: process.env.ELASTIC_ENDPOINT,
    auth: {
      username: process.env.ELASTIC_USERNAME,
      password: process.env.ELASTIC_PASSWORD
    },
    tls: {
      key: await fs.readFile('./certs/elastic-certificates.key'),
      cert: await fs.readFile('./certs/elastic-certificates.crt'),
      ca: await fs.readFile('./certs/elastic-stack-ca.pem'),
      rejectUnauthorized: true
    }
  })
  return client
}

export const connectToElastic = async (logger: Logger) => {
  const getElasticClientUntilSuccess = async () => {
    let connect: Client
    await loopRetrying(
      async () => {
        connect = await getElasticClient()
        return true
      },
      { logger }
    )
    return connect
  }

  let client = await getElasticClientUntilSuccess()

  const reconnect = async () => {
    client = await getElasticClientUntilSuccess()
  }

  return {
    client,
    reconnect
  }
}

export async function checkFileExists(file) {
  try {
    await fs.access(file)
    return true // The file exists
  } catch {
    return false // The file does not exist
  }
}

export async function logError(logger, e) {
  if (logger) {
    logger.error({
      error: e.name,
      message: e.message,
      stack: e.stack
    })
    return
  }
  console.error('❌', e)
}

export async function logInfo(logger, e) {
  if (logger) {
    logger.info({
      error: e.name,
      message: e.message,
      stack: e.stack
    })
    return
  }
  console.info('❌', e)
}

export async function loopRetrying(
  callback,
  options: {
    logger?: Logger
    catchDelayMs?: number
    afterCallbackDelayMs?: number
    afterErrorCallback?: () => Promise<unknown>
  } = {
    logger: undefined,
    catchDelayMs: 0,
    afterCallbackDelayMs: 0,
    afterErrorCallback: async () => {}
  }
) {
  for (;;) {
    try {
      const result = await callback()
      if (options.afterCallbackDelayMs)
        await delay(options.afterCallbackDelayMs)
      if (result) break
    } catch (e) {
      if (e instanceof InfoMessage) await logInfo(options.logger, e)
      else await logError(options.logger, e)
      if (options.catchDelayMs) await delay(options.catchDelayMs)
      await options?.afterErrorCallback?.()
    }
  }
}

export function getRandomElement(arr) {
  if (arr && arr.length) {
    const index = Math.floor(Math.random() * arr.length)
    return arr[index]
  }
  return null
}

export function getDateUtc() {
  const now = new Date()
  const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000)
  return utcNow
}

export function dateToYyyyMmDdHhMmSs(date) {
  return new Date(date).toISOString().slice(0, 19).replace('T', ' ')
}
