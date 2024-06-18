import { getProxyForKey } from '.'
import { getDbConnection } from '../../../utils'
import { selectRandomOcrKey, selectRandomOcrKeyPro } from '../../../utils/mysql-queries'

type TOcrKey = {
  key: string
  timeout: string | null
  proxy: undefined
  protocol: undefined
}

type TOcrKeyWithProxy = Pick<TOcrKey, 'key' | 'timeout'> & {
  proxy: `${string}:${number}`
  protocol: string
}

export async function chooseRandomOCRSpaceKey(): Promise<TOcrKey | TOcrKeyWithProxy> {
  const db = await getDbConnection()
  // Select a random key without timeout or with the early date
  const [keysPro] = await selectRandomOcrKeyPro(db)
  if (keysPro) {
    await db.close()
    return {
      key: keysPro.ocrKey,
      timeout: keysPro.timeout,
      proxy: undefined,
      protocol: undefined,
    }
  }

  const [keys] = await selectRandomOcrKey(db)
  if (!keys) {
    await db.close()
    throw new Error('❌ There are no keys without timeout')
  }

  const foundProxy = await getProxyForKey(db, keys.ocrKey)
  await db.close()
  if (!foundProxy) throw new Error('There are no available free proxies')
  if (!foundProxy.address) throw new Error(`❌ Proxy for ${keys.ocrKey} isn't found`)
  return {
    key: keys.ocrKey,
    timeout: keys.timeout,
    proxy: foundProxy.address,
    protocol: foundProxy.protocol,
  }
}
