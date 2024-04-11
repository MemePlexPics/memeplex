import { SocksProxyAgent } from 'socks-proxy-agent'

export const insertProxyToRequest = (request, protocol, host, port) => {
  if (protocol === 'http') {
    request.proxy = {
      host,
      port,
      protocol: 'http',
    }
  } else {
    request.httpAgent = new SocksProxyAgent(`${protocol}://${host}:${port}`)
    request.httpsAgent = request.httpAgent
  }
}
