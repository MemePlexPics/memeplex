import { ELASTIC_INDEX, ELASTIC_FUZZINESS } from '../../../constants'
import { getMemeResponseEntity } from '.'
import type { Client } from '@elastic/elasticsearch'
import type { TElasticMemeEntity } from '../../types'

export const searchMemes = async (
  client: Client,
  query: string,
  page: number,
  size: number,
  abortController?: AbortController,
) => {
  const from = (page - 1) * size

  const elasticRes = await client.search<TElasticMemeEntity>(
    {
      index: ELASTIC_INDEX,
      from,
      size,
      query: {
        bool: {
          must_not: [
            {
              match: {
                state: 1, // we hide soft-deleted memes
              },
            },
          ],
          minimum_should_match: 1,
          should: [
            {
              function_score: {
                query: {
                  match_phrase_prefix: {
                    eng: {
                      query,
                    },
                  },
                },
                boost: 100,
                boost_mode: 'sum',
              },
            },
            {
              function_score: {
                query: {
                  match: {
                    eng: {
                      query,
                      fuzziness: ELASTIC_FUZZINESS,
                    },
                  },
                },
              },
            },
            {
              function_score: {
                query: {
                  match: {
                    eng: {
                      query,
                    },
                  },
                },
                boost: 50,
                boost_mode: 'sum',
              },
            },
          ],
        },
      },
    },
    abortController ? { signal: abortController.signal } : {},
  )

  const total =
    typeof elasticRes.hits.total === 'object' && 'value' in elasticRes.hits.total
      ? elasticRes.hits.total.value
      : 0
  const response: {
    result: ReturnType<typeof getMemeResponseEntity>[]
    total: number
    totalPages: number
  } = {
    result: [],
    total,
    totalPages: Math.ceil(total / size),
  }
  for (const hit of elasticRes.hits.hits) {
    if (!hit._source) continue
    response.result.push(getMemeResponseEntity(hit._id, hit._source))
  }

  return response
}
