import process from 'process'

import { getDbConnection } from '../../utils'
import { insertOcrKeys, insertOcrKeysPro } from '../../utils/mysql-queries'

export const insertOcrKeysIntoDb = async () => {
  const keys = process.env.OCR_SPACE_API_KEYS
  if (typeof keys === 'undefined') {
    throw 'specify OCR_SPACE_API_KEYS, a comma-separated list of ocs.space keys'
  }
  const keysPro = process.env.OCR_SPACE_API_KEYS_PRO

  const db = await getDbConnection()
  const keysTrimmed = keys.split(',').map((key) => ({ ocrKey: key.trim() }))
  await insertOcrKeys(db, keysTrimmed)
  if (keysPro) {
    const keysProTrimmed = keysPro.split(',').map((key) => ({ ocrKey: key.trim() }))
    await insertOcrKeysPro(db, keysProTrimmed)
  }
}
