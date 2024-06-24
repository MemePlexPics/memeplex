import { ELASTIC_INDEX } from '../../../constants'
import { getMemeResponseEntity } from '.'
import type { Client } from '@elastic/elasticsearch'
import type { TElasticMemeEntity } from '../../types'

export const getMeme = async (client: Client, id: string) => {
  const elasticRes = await client.get<TElasticMemeEntity>({
    index: ELASTIC_INDEX,
    id,
  })

  if (!elasticRes._source) {
    throw new Error(`There is no meme «${id}» in ${ELASTIC_INDEX}`)
  }

  return getMemeResponseEntity(id, elasticRes._source)
}
