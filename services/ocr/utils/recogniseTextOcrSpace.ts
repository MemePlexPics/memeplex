import { chooseRandomOCRSpaceKey, handle403, handleDeadProxy, handleProxyError, ocrSpace } from '.'
import { getMysqlClient } from '../../../utils'
import { updateProxyAvailability } from '../../../utils/mysql-queries'
import { OCR_SPACE_PRO_API_USA } from '../../../constants'
import { Logger } from 'winston'

export const recogniseTextOcrSpace = async (fileName: string, language: string, logger: Logger) => {
  const { key: apiKey, proxy, protocol } = await chooseRandomOCRSpaceKey()
  logger.verbose(`💬 Key: ${apiKey} ${proxy ? `${proxy} (${protocol})` : ''}`)
  try {
    const [host, port] = proxy ? proxy.split(':') : [null, null]
    const res = await ocrSpace(fileName, {
      ocrUrl: proxy ? undefined : OCR_SPACE_PRO_API_USA,
      apiKey,
      language,
      proxy: proxy
        ? {
          host,
          port,
          protocol,
        }
        : undefined,
      OCREngine: language == 'eng' ? '2' : '1',
      // see here for engine descriptions: http://ocr.space/OCRAPI
    })
    console.log('💬', res)

    if (res.IsErroredOnProcessing) throw new Error(res?.ErrorMessage?.join())
    await handleDeadProxy(res, proxy, protocol)

    if (proxy) {
      const mysql = await getMysqlClient()
      await updateProxyAvailability(mysql, proxy, protocol, true)
      await mysql.end()
    }

    const text = []
    for (const result of res.ParsedResults) {
      text.push(result.ParsedText.replace(/\r\n/g, ' '))
    }

    return text.join(' ')
  } catch (error) {
    await handle403(error, apiKey)
    await handleProxyError(error, proxy, protocol)
    throw error
  }
}
