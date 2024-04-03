import { selectFastestAvailableProxyWithExactKey, selectFastestAvailableProxyWithoutKey, updateProxyOcrKey } from "../../../utils/mysql-queries"
import { TDbConnection } from "../../../utils/types"

export async function getProxyForKey(db: TDbConnection, key: string) {
  const [oldProxies] = await selectFastestAvailableProxyWithExactKey(db, key)
  if (oldProxies) return oldProxies
  const [freeAvailableProxies] = await selectFastestAvailableProxyWithoutKey(db)
  if (freeAvailableProxies) {
    const foundProxy = freeAvailableProxies
    await updateProxyOcrKey(
      db,
      key,
      foundProxy.address,
      foundProxy.protocol,
    )
    return foundProxy
  }
}
