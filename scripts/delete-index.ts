import 'dotenv/config'
import process from 'process'

import { ELASTIC_INDEX } from '../constants/index'
import { getElasticClient } from '../utils/index'

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'

const client = getElasticClient()

async function deleteIndex(indexName) {
  await (await client).indices.delete({ index: indexName })
}

try {
  deleteIndex(ELASTIC_INDEX)
} catch (error) {
  console.error(error)
}
