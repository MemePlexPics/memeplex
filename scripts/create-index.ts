import 'dotenv/config'
import process from 'process'

import { ELASTIC_INDEX } from '../constants/index'
import { getElasticClient } from '../utils/index'

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'

const client = getElasticClient()

// async function health() {
//   let connected = false
//   while (!connected) {
//     console.log('💬 Connecting to Elasticsearch')
//     const health = await client.cluster.health({})
//     connected = true
//     console.log('💬', health.body)
//     return health
//   }
// }

async function createIndex(indexName) {
  try {
    const response = await (
      await client
    ).indices.create({
      index: indexName,
      mappings: {
        properties: {
          timestamp: {
            type: 'date',
            format: 'strict_date_optional_time||epoch_second',
          },
          date: {
            type: 'date',
            format: 'strict_date_optional_time||epoch_second',
          },
        },
      },
    })
    console.log('💬 Index created:', response)
  } catch (error) {
    console.error('❌ An error occurred:', error)
  }
}

async function deleteIndex(indexName) {
  await (await client).indices.delete({ index: indexName })
}

// health();

try {
  deleteIndex(ELASTIC_INDEX)
} catch (error) {
  console.error(error)
}

createIndex(ELASTIC_INDEX)
