import { loopRetrying } from '../utils'
import { LOOP_RETRYING_DELAY } from '../constants'
import { serviceSettings } from './constants'
import { getLogger, insertOcrKeysIntoDb } from './utils'
import type { Logger } from 'winston'
import winston from 'winston'

const loggers = winston.loggers

const startServices = async (loggerMain: Logger) => {
  serviceSettings.forEach(service => {
    const logger = getLogger(loggers, service.name)
    loopRetrying(
      async () => {
        loggerMain.info(`${service.name} started`)
        await service.service(logger)
      },
      {
        logger,
        catchDelayMs: LOOP_RETRYING_DELAY,
        ...service?.loopSettings,
      },
    )
  })
}

const main = async () => {
  const loggerMain = getLogger(loggers, 'main')
  loggerMain.info('Hello, MemeSearch')
  await insertOcrKeysIntoDb()
  await startServices(loggerMain)
}

main()
