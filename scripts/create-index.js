import 'dotenv/config';
import { Client } from '@elastic/elasticsearch';
import { ELASTIC_INDEX } from '../src/const.js';
import { getElasticClient } from '../src/utils.js';

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const client = await getElasticClient();

async function health() {
    let connected = false;
    while (!connected) {
        console.log('💬 Connecting to Elasticsearch');
        const health = await client.cluster.health({});
        connected = true;
        console.log('💬', health.body);
        return health;
    }
}

async function createIndex(indexName) {
    try {
        const response = await client.indices.create({
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
        });
        console.log('💬 Index created:', response);
    } catch (error) {
        console.error('❌ An error occurred:', error);
    }
}

async function deleteIndex (indexName) {
    await client.indices.delete({ index: indexName });
}

// health();

try {
    await deleteIndex(ELASTIC_INDEX);
} catch (_) {

}

await createIndex(ELASTIC_INDEX);
