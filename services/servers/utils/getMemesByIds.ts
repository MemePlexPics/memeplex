import { ELASTIC_INDEX } from '../../../constants'
import { getMemeResponseEntity } from '.'
import type { Client } from '@elastic/elasticsearch'
import type { TElasticMemeEntity } from '../../types'
import type { GetGetResult } from '@elastic/elasticsearch/lib/api/types'

export const getMemesByIds = async (
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
    const meme = doc as GetGetResult<TElasticMemeEntity>
    if (!meme._source) return
    return getMemeResponseEntity(doc._id, meme._source)
  })
}
