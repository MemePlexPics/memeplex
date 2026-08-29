import type { Client } from '@elastic/elasticsearch'
import { ELASTIC_INDEX } from '../../../constants'

const HOUR_SECONDS = 60 * 60
const DAY_SECONDS = 24 * HOUR_SECONDS
const WEEK_SECONDS = 7 * DAY_SECONDS
const THIRTY_DAYS_SECONDS = 30 * DAY_SECONDS
const LONG_RANGE_CACHE_TTL_MS = HOUR_SECONDS * 1000

type TLongRangeMemeStats = {
  total: number
  lastWeek: number
  last30Days: number
}

let longRangeCache: { value: TLongRangeMemeStats; expiresAt: number } | undefined
let longRangeRequest: Promise<TLongRangeMemeStats> | undefined

const countMemesSince = async (client: Client, timestamp?: number) => {
  if (timestamp === undefined) {
    const response = await client.count({ index: ELASTIC_INDEX })
    return response.count
  }

  const response = await client.count({
    index: ELASTIC_INDEX,
    query: {
      range: {
        timestamp: {
          gte: String(timestamp),
        },
      },
    },
  })
  return response.count
}

const getLongRangeMemeStats = async (client: Client, now: number) => {
  if (longRangeCache && longRangeCache.expiresAt > Date.now()) {
    return longRangeCache.value
  }
  if (longRangeRequest) {
    return longRangeRequest
  }

  longRangeRequest = Promise.all([
    countMemesSince(client),
    countMemesSince(client, now - WEEK_SECONDS),
    countMemesSince(client, now - THIRTY_DAYS_SECONDS),
  ])
    .then(([total, lastWeek, last30Days]) => {
      const value = { total, lastWeek, last30Days }
      longRangeCache = {
        value,
        expiresAt: Date.now() + LONG_RANGE_CACHE_TTL_MS,
      }
      return value
    })
    .finally(() => {
      longRangeRequest = undefined
    })

  return longRangeRequest
}

export const getMemeStats = async (client: Client) => {
  const now = Math.floor(Date.now() / 1000)
  const [lastHour, last24Hours, longRange] = await Promise.all([
    countMemesSince(client, now - HOUR_SECONDS),
    countMemesSince(client, now - DAY_SECONDS),
    getLongRangeMemeStats(client, now),
  ])

  return {
    ...longRange,
    lastHour,
    last24Hours,
  }
}
