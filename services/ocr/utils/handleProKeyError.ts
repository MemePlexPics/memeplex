import { OCR_SPACE_403_DELAY } from '../../../constants'
import { InfoMessage, dateToYyyyMmDdHhMmSs, getDbConnection } from '../../../utils'
import { updateProKeyTimeout } from '../../../utils/mysql-queries'

export const handleProKeyError = async (error: Error, apiKey: string) => {
  if (error.message.startsWith('connect ETIMEDOUT')) {
    const newTimeout = dateToYyyyMmDdHhMmSs(Date.now() + OCR_SPACE_403_DELAY)
    const db = await getDbConnection()
    await updateProKeyTimeout(db, apiKey, newTimeout)
    await db.close()
    throw new InfoMessage(
      `❗️ connect ETIMEDOUT from ocr.space for key ${apiKey}, ${error.name}: ${error.message}`,
    )
  }
}
