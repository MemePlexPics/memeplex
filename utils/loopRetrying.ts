import { Logger } from 'winston'
import { InfoMessage, delay, logError, logInfo } from '.'

export async function loopRetrying(
  callback: () => Promise<unknown | boolean>,
  options: {
    logger?: Logger
    catchDelayMs?: number
    afterCallbackDelayMs?: number
    afterErrorCallback?: () => Promise<unknown>
    abortSignal?: AbortSignal
  } = {
    logger: undefined,
    catchDelayMs: 0,
    afterCallbackDelayMs: 0,
    afterErrorCallback: async () => {},
  },
) {
  for (;;) {
    if (options.abortSignal?.aborted) {
      if (options.logger) options.logger.info('Loop aborted')
      break
    }

    try {
      const result = await callback()
      if (options.afterCallbackDelayMs) await delay(options.afterCallbackDelayMs)
      if (result) break
    } catch (e) {
      if (e instanceof InfoMessage && options.logger) await logInfo(options.logger, e)
      else if (e instanceof Error && options.logger) await logError(options.logger, e)
      if (options.catchDelayMs) await delay(options.catchDelayMs)
      await options?.afterErrorCallback?.()
    }
  }
}
