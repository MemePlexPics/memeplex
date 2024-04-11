import { Logger } from 'winston'

export async function logError(logger: Logger, e: Error, additionalInfo?: object) {
  if (logger) {
    logger.error({
      error: e.name,
      message: e.message,
      stack: e.stack,
      ...additionalInfo,
    })
    return
  }
  console.error('❌', e)
}
