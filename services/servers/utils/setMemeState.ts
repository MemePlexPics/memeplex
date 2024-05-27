import type { Client } from '@elastic/elasticsearch'
import { ELASTIC_INDEX } from '../../../constants'

export const setMemeState = async (client: Client, id: string, state: 0 | 1) => {
  const elasticRes = await client.update({
    index: ELASTIC_INDEX,
    id,
    doc: {
      state,
    },
  })

  return elasticRes
}
