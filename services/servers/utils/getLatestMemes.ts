import { ELASTIC_INDEX } from '../../../constants'
import { getMemeResponseEntity } from '.'
import type { Client } from '@elastic/elasticsearch'
import type { TMemeEntity } from '../../types'

export const getLatestMemes = async (
  client: Client,
  from: number | undefined,
  to: number | undefined,
  size: number,
  filtersString?: string,
) => {
  const filterObject: {
    channel: string[]
    not?: {
      state?: null | 1
    }
  } | null = filtersString ? JSON.parse(filtersString) : null
  const additionalFilter: {
    must?: {
      terms: {
        channelName: string[]
      }
    }
    must_not?: {
      term: {
        state: number
      }
    }
  } = {}
  if (filterObject?.channel?.length) {
    additionalFilter.must = {
      terms: {
        channelName: [],
      },
    }
    filterObject.channel.forEach(channel => {
      if (additionalFilter.must && /[0-9a-zA-Z_]+/.test(channel)) {
        additionalFilter.must.terms.channelName.push(channel.toLowerCase())
      }
    })
  }
  if (filterObject?.not?.state !== null) {
    const state = typeof filterObject?.not?.state === 'number' ? filterObject.not.state : 1
    additionalFilter.must_not = {
      term: {
        state,
      },
    }
  }
  const elasticRes = await client.search<TMemeEntity>({
    index: ELASTIC_INDEX,
    size,
    query: {
      bool: {
        ...additionalFilter,
        filter: {
          range: {
            timestamp: {
              gt: from ? `${from}` : undefined,
              lt: to ? `${to}` : undefined,
            },
          },
        },
      },
    },
    sort: {
      timestamp: !Number.isInteger(to) && Number.isInteger(from) ? 'asc' : 'desc',
    },
  })

  const total = typeof elasticRes.hits.total !== 'number' ? elasticRes.hits.total?.value : undefined
  const response = {
    result: [],
    from: undefined,
    to: undefined,
    total,
    totalPages: Math.ceil(total / size),
  }
  for (const hit of elasticRes.hits.hits) {
    const timestamp = hit._source.timestamp
    if (!response.from || timestamp < response.from) response.from = timestamp
    if (!response.to || timestamp > response.to) response.to = timestamp
    response.result.push(getMemeResponseEntity(hit._id, hit._source))
  }

  return response
}
