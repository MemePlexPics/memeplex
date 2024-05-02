import { AxiosError } from 'axios'
import { OCR_SPACE_403_DELAY } from '../../../constants'
import { InfoMessage, dateToYyyyMmDdHhMmSs, getDbConnection } from '../../../utils'
import { updateKeyTimeout } from '../../../utils/mysql-queries'

export const handle403 = async (error: AxiosError, apiKey: string) => {
  if (error?.response?.status === 403) {
    const newTimeout = dateToYyyyMmDdHhMmSs(Date.now() + OCR_SPACE_403_DELAY)
    const db = await getDbConnection()
    await updateKeyTimeout(db, apiKey, newTimeout)
    await db.close()
    throw new InfoMessage(
      `❗️ 403 from ocr.space for key ${apiKey}, ${error.name}: ${error.message}`,
    )
  }
}
