import {
  chooseRandomOCRSpaceKey,
  handle403,
  handleDeadProxy,
  handleProKeyError,
  handleProxyError,
  ocrSpace,
} from '.'
import { InfoMessage, getDbConnection } from '../../../utils'
import { updateProxyAvailability } from '../../../utils/mysql-queries'
import { OCR_SPACE_PRO_API_USA } from '../../../constants'
import { AxiosError } from 'axios'

export const recogniseTextOcrSpace = async (fileName: string, language: string) => {
  const { key: apiKey, proxy, protocol } = await chooseRandomOCRSpaceKey()
  try {
    const [host, port] = proxy ? proxy.split(':') : [null, null]
    const res = await ocrSpace(fileName, {
      ocrUrl: proxy ? undefined : OCR_SPACE_PRO_API_USA,
      apiKey,
      language,
      proxy:
        proxy && host
          ? {
            host,
            port: Number(port),
            protocol,
          }
          : undefined,
      OCREngine: language == 'eng' ? '2' : '1',
      // see here for engine descriptions: http://ocr.space/OCRAPI
    })
    console.log('💬', res)

    if (res.IsErroredOnProcessing) throw new Error(res?.ErrorMessage?.join())

    if (proxy) {
      await handleDeadProxy(res, proxy, protocol)
      const db = await getDbConnection()
      await updateProxyAvailability(db, proxy, protocol, 1)
      await db.close()
    }

    const text = []
    for (const result of res.ParsedResults) {
      text.push(result.ParsedText.replace(/\r\n/g, ' '))
    }

    return text.join(' ')
  } catch (error) {
    if (error instanceof AxiosError) {
      await handle403(error, apiKey)
    }
    if (proxy && error instanceof AxiosError) {
      await handleProxyError(error, proxy, protocol)
    } else if (error instanceof Error) {
      await handleProKeyError(error, apiKey)
    }
    if (
      error instanceof Error &&
      (error.message.startsWith('E301') || error.message.startsWith('Unable to process the file'))
    ) {
      throw new InfoMessage(`E301: Unable to process the file`)
    }
    throw error
  }
}
