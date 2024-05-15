import { CreateAxiosDefaults } from 'axios'
import { SocksProxyAgent } from 'socks-proxy-agent'

export const insertProxyToRequest = (
  request: CreateAxiosDefaults,
  protocol: string,
  host: string,
  port: number,
) => {
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
