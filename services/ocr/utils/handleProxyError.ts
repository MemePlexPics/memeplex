import { AxiosError } from 'axios'
import { InfoMessage, getMysqlClient } from '../../../utils'
import { updateProxyAvailability } from '../../../utils/mysql-queries'

export const handleProxyError = async (error: AxiosError, proxy?: string, protocol?: string) => {
  if (
    proxy &&
    (error.name === 'AxiosError' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ERR_BAD_REQUEST' ||
      error.code === 'ECONNRESET' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'EHOSTUNREACH' ||
      error.message === 'socket hang up' ||
      error.message === 'Socket closed' ||
      error.message === 'Proxy connection timed out' ||
      error.message.startsWith('Socks5 proxy rejected connection') ||
      error.message.startsWith('connect ECONNREFUSED') || // somehow this is not the same error as the error.code === 'ECONNREFUSED'
      error.message.startsWith('read ECONNRESET') || // the same as above
      error.message.startsWith('connect EHOSTUNREACH')) // ...
  ) {
    const mysql = await getMysqlClient()
    await updateProxyAvailability(mysql, proxy, protocol, false)
    mysql.end()
    throw new InfoMessage(`Proxy error:, «${error.code}» ${error.name} ${error.message}`)
  }
}
