import { Logger } from 'winston'

export async function logInfo(logger: Logger, e: Error, additionalInfo?: object) {
  if (logger) {
    logger.info({
      error: e.name,
      message: e.message,
      stack: e.stack,
      ...additionalInfo,
    })
    return
  }
  console.info('❌', e)
}
