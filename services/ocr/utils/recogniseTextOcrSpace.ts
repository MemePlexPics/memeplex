import { chooseRandomOCRSpaceKey, ocrSpace } from '.'
import {
  getMysqlClient,
  dateToYyyyMmDdHhMmSs,
} from '../../../utils'
import {
  saveKeyTimeout,
  updateProxyAvailability,
} from '../../../utils/mysql-queries'
import { OCR_SPACE_403_DELAY } from '../../../constants'
import { InfoMessage } from '../../../utils'

export const recogniseTextOcrSpace = async (fileName, language) => {
  let res
  const {
    key: apiKey,
    proxy,
    protocol,
  } = await chooseRandomOCRSpaceKey()
  try {
    const [host, port] = proxy ? proxy.split(':') : [null, null]
    res = await ocrSpace(fileName, {
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
  } catch (error) {
    if (error?.response?.status === 403) {
      const newTimeout = dateToYyyyMmDdHhMmSs(
        Date.now() + OCR_SPACE_403_DELAY,
      )
      const mysql = await getMysqlClient()
      await saveKeyTimeout(mysql, apiKey, newTimeout)
      mysql.end()
      throw new InfoMessage(
        `❗️ 403 from ocr.space for key ${apiKey}, ${error.name}: ${error.message}`,
      )
    }
    if (
      proxy && (
        error.name === 'AxiosError' ||
        error.code === 'ECONNREFUSED' ||
        error.code === 'ERR_BAD_REQUEST' ||
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT' ||
        error.code === 'EHOSTUNREACH' ||
        error.message === 'socket hang up' ||
        error.message === 'Socket closed' ||
        error.message === 'Proxy connection timed out' ||
        error.message.startsWith('Socks5 proxy rejected connection') ||
        error.message.startsWith('connect ECONNREFUSED') || // somehow this is not the same error as the error.code === 'ECONNREFUSED'
        error.message.startsWith('read ECONNRESET') // the same as above
      )
    ) {
      const mysql = await getMysqlClient()
      await updateProxyAvailability(mysql, proxy, protocol, false)
      mysql.end()
      throw new InfoMessage(
        `Proxy error:, «${error.code}» ${error.name} ${error.message}`,
      )
    }
    throw error
  }

  if (res.IsErroredOnProcessing) throw new Error(res?.ErrorMessage?.join())

  if (proxy && !Array.isArray(res?.ParsedResults)) {
    const mysql = await getMysqlClient()
    await updateProxyAvailability(mysql, proxy, protocol, false)
    mysql.end()
    throw new InfoMessage(
      `Invalid res.ParsedResults, probably dead proxy ${proxy} (${protocol}). ${JSON.stringify(res)}`,
    )
  }

  if (proxy) {
    const mysql = await getMysqlClient()
    await updateProxyAvailability(mysql, proxy, protocol, true)
    mysql.end()
  }

  const text = []
  for (const result of res.ParsedResults) {
    text.push(result.ParsedText.replace(/\r\n/g, ' '))
  }
  return text.join(' ')
}
