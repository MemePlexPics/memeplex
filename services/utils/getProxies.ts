import { PROXY_LIST_API_URLS } from '../../constants'

const getProxyList = async (url: string) => {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(15_000),
    })
    return await response.text()
  } catch (error) {
    return null
  }
}

export const getProxies = async () => {
  const proxiesByProtocol: Record<string, Set<string>> = {}
  const regex = /\b(?:\d{1,3}\.){3}\d{1,3}:\d{1,5}\b/g

  for (const [protocol, proxyLists] of Object.entries(PROXY_LIST_API_URLS)) {
    if (!proxiesByProtocol[protocol]) proxiesByProtocol[protocol] = new Set()
    for (const proxyList of proxyLists) {
      const proxies = await getProxyList(proxyList)
      if (proxies === null) return
      const matches = proxies.match(regex)
      matches?.forEach(proxy => proxiesByProtocol[protocol].add(proxy))
    }
  }
  return Object.entries(proxiesByProtocol).reduce<
  {
    port: number
    ip: string
    protocol: string
  }[]
  >((acc, [protocol, proxyList]) => {
    proxyList.forEach(proxy => {
      const [ip, port] = proxy.split(':')
      acc.push({
        ip,
        port: Number(port),
        protocol,
      })
    })
    return acc
  }, [])
}
