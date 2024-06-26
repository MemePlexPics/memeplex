import { linkKeyToProxy } from '.'

export async function getProxyForKey(mysql, key) {
  const [oldProxies] = await mysql.query(
    `
            SELECT
                address,
                protocol,
                speed
            FROM proxies
            WHERE
                anonymity IN ('anonymous', 'elite')
                AND availability = 1
                AND ocr_key = ?
            ORDER BY speed LIMIT 1
        `,
    [key],
  )
  if (oldProxies.length) return oldProxies[0]
  const [freeAvailableProxies] = await mysql.execute(`
            SELECT
                address,
                protocol,
                speed
            FROM proxies
            WHERE
                anonymity IN ('anonymous', 'elite')
                AND availability = 1
                AND ocr_key IS NULL
            ORDER BY speed LIMIT 1
        `)
  if (freeAvailableProxies.length) {
    const foundProxy = freeAvailableProxies[0]
    await linkKeyToProxy(mysql, key, foundProxy.address, foundProxy.protocol)
    return foundProxy
  }
}
