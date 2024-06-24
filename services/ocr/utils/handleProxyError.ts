import type { AxiosError } from 'axios'
import { InfoMessage, getDbConnection } from '../../../utils'
import { updateProxyAvailability } from '../../../utils/mysql-queries'

export const handleProxyError = async (
  error: AxiosError,
  proxy: `${string}:${number}`,
  protocol: string,
) => {
  if (
    error.name === 'AxiosError' ||
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
    error.message.startsWith('connect EHOSTUNREACH') // ...
  ) {
    const db = await getDbConnection()
    await updateProxyAvailability(db, proxy, protocol, 0)
    await db.close()
    throw new InfoMessage(`Proxy error:, «${error.code}» ${error.name} ${error.message}`)
  }
}
