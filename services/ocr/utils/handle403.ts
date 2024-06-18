import type { AxiosError } from 'axios'
import { InfoMessage, getDbConnection } from '../../../utils'
import { updateKeyTimeout } from '../../../utils/mysql-queries'

export const handle403 = async (error: AxiosError, apiKey: string) => {
  if (error?.response?.status === 403) {
    const db = await getDbConnection()
    await updateKeyTimeout(db, apiKey)
    await db.close()
    throw new InfoMessage(
      `❗️ 403 from ocr.space for key ${apiKey}, ${error.name}: ${error.message}`,
    )
  }
}
