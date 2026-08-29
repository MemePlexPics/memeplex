import { statfs } from 'fs/promises'

const GIB_BYTES = 1024n * 1024n * 1024n
const CACHE_TTL_MS = 60 * 60 * 1000

let cache: { value: number; expiresAt: number } | undefined
let request: Promise<number> | undefined

export const getServerFreeSpaceGb = async () => {
  if (cache && cache.expiresAt > Date.now()) {
    return cache.value
  }
  if (request) {
    return request
  }

  request = statfs('.', { bigint: true })
    .then(stats => {
      const value = Number((stats.bavail * stats.bsize) / GIB_BYTES)
      cache = {
        value,
        expiresAt: Date.now() + CACHE_TTL_MS,
      }
      return value
    })
    .finally(() => {
      request = undefined
    })

  return request
}
