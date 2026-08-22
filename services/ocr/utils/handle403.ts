import type { AxiosError } from 'axios'
import { InfoMessage, getDbConnection } from '../../../utils'
import { updateKeyTimeout, updateProKeyTimeout } from '../../../utils/mysql-queries'

const ocrSpace403Message = (error: AxiosError) => {
  const data = error.response?.data
  if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
    return data.error
  }
  return undefined
}

export const handle403 = async (error: AxiosError, apiKey: string, isPro: boolean) => {
  if (error?.response?.status !== 403) return
  const ocrError = ocrSpace403Message(error)
  // Broken free proxies often answer 403 HTML. Timing the key out for those would
  // spend every key in half an hour and never mark the proxy dead.
  if (!ocrError) return
  const db = await getDbConnection()
  // Pro keys live in their own table. Timing out the wrong one updates no rows, which
  // leaves the key eligible forever: it is picked ahead of every free key, fails again,
  // and the free keys and their proxies are never reached.
  if (isPro) await updateProKeyTimeout(db, apiKey)
  else await updateKeyTimeout(db, apiKey)
  await db.close()
  throw new InfoMessage(
    `❗️ 403 from ocr.space for key ${apiKey}: ${ocrError}`,
  )
}
