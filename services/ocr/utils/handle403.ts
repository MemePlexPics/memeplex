import { AxiosError } from 'axios'
import { OCR_SPACE_403_DELAY } from '../../../constants'
import { InfoMessage, dateToYyyyMmDdHhMmSs, getMysqlClient } from '../../../utils'
import { saveKeyTimeout } from '../../../utils/mysql-queries'

export const handle403 = async (error: AxiosError, apiKey: string) => {
  if (error?.response?.status === 403) {
    const newTimeout = dateToYyyyMmDdHhMmSs(Date.now() + OCR_SPACE_403_DELAY)
    const mysql = await getMysqlClient()
    await saveKeyTimeout(mysql, apiKey, newTimeout)
    mysql.end()
    throw new InfoMessage(
      `❗️ 403 from ocr.space for key ${apiKey}, ${error.name}: ${error.message}`,
    )
  }
}
