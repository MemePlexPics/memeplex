import { getProxyForKey } from "."
import { getDbConnection } from "../../../utils"
import { selectRandomOcrKey, selectRandomOcrKeyPro } from "../../../utils/mysql-queries"

export async function chooseRandomOCRSpaceKey() {
  const db = await getDbConnection()
  // Select a random key without timeout or with the early date
  const keysPro = await selectRandomOcrKeyPro(db)
  if (keysPro.length) {
    db.close()
    return {
      key: keysPro[0].ocrKey,
      timeout: keysPro[0].timeout,
    }
  }

  const keys = await selectRandomOcrKey(db)
  if (!keys.length) {
    db.close()
    throw new Error('❌ There are no keys without timeout')
  }

  const keyData = keys[0]
  const finalKeyData: {
    key: string
    timeout: string
    proxy?: string
    protocol?: string
  } = {
    key: keyData.ocrKey,
    timeout: keyData.timeout
  }
  const foundProxy = await getProxyForKey(db, keyData.ocrKey)
  db.close()
  if (!foundProxy) throw new Error('There are no available free proxies')
  finalKeyData.proxy = foundProxy.address
  finalKeyData.protocol = foundProxy.protocol
  if (!finalKeyData.proxy)
    throw new Error(`❌ Proxy for ${finalKeyData.key} isn't found`)
  return finalKeyData
}
