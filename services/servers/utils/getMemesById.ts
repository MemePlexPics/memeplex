import { ELASTIC_INDEX } from '../../../constants'
import { getMemeResponseEntity } from '.'
import { Client } from '@elastic/elasticsearch'
import { TElasticMemeEntity } from '../../types'
import { GetGetResult } from '@elastic/elasticsearch/lib/api/types'

export const getMemesById = async (
  client: Client,
  ids: string[],
  abortController?: AbortController,
) => {
  const elasticRes = await client.mget<TElasticMemeEntity>(
    {
      index: ELASTIC_INDEX,
      ids,
    },
    abortController ? { signal: abortController.signal } : {},
  )

  return elasticRes.docs.map(doc => {
    if (!Object.hasOwn(doc, 'found')) return
    return getMemeResponseEntity(doc._id, (doc as GetGetResult<TElasticMemeEntity>)._source)
  })
}
