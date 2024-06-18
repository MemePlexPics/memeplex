import { InfoMessage, getDbConnection } from '../../../utils'
import { updateProKeyTimeout } from '../../../utils/mysql-queries'

export const handleProKeyError = async (error: Error, apiKey: string) => {
  if (error.message.startsWith('connect ETIMEDOUT')) {
    const db = await getDbConnection()
    await updateProKeyTimeout(db, apiKey)
    await db.close()
    throw new InfoMessage(
      `❗️ connect ETIMEDOUT from ocr.space for key ${apiKey}, ${error.name}: ${error.message}`,
    )
  }
}
