import process from 'process'

import { getDbConnection } from '../../utils'
import { insertOcrKeys, insertOcrKeysPro } from '../../utils/mysql-queries'

export const insertOcrKeysIntoDb = async () => {

  const keys = process.env.OCR_SPACE_API_KEYS.split(',')
  const keysPro = process.env.OCR_SPACE_API_KEYS_PRO.split(',')
  if (typeof keys === 'undefined') {
    throw 'specify OCR_SPACE_API_KEYS, a comma-separated list of ocs.space keys'
  }

  const db = await getDbConnection()
  const keysTrimmed = keys.map((key) => ({ ocrKey: key.trim() }))
  const keysProTrimmed = keysPro.map((key) => ({ ocrKey: key.trim() }))
  const [insertedKeysResponse] = await insertOcrKeys(db, keysTrimmed)
  const [insertedKeysProResponse] = await insertOcrKeysPro(db, keysProTrimmed)
  console.log(`💬 OCR keys inserted: ${insertedKeysResponse.affectedRows} free and ${insertedKeysProResponse.affectedRows} PRO `)
}
