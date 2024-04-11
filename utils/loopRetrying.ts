import { Logger } from 'winston'
import { InfoMessage, delay, logError, logInfo } from '.'

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
    afterErrorCallback: async () => {},
  },
) {
  for (;;) {
    try {
      const result = await callback()
      if (options.afterCallbackDelayMs) await delay(options.afterCallbackDelayMs)
      if (result) break
    } catch (e) {
      if (e instanceof InfoMessage) await logInfo(options.logger, e)
      else await logError(options.logger, e)
      if (options.catchDelayMs) await delay(options.catchDelayMs)
      await options?.afterErrorCallback?.()
    }
  }
}
