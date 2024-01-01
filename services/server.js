import express from 'express';
import * as path from 'path';
import 'dotenv/config';
import { getElasticClient } from '../src/utils.js';
import {
    ELASTIC_INDEX,
    MAX_SEARCH_QUERY_LENGTH
}  from '../src/const.js';

const client = await getElasticClient();

const app = express();
app.use(express.static('static'));
app.use('/data', express.static('data'));

export const classifyQueryLanguage = query => {
    // TODO
    return 'eng';
};

app.get('/search', async (req, res) => {
    const query = req.query.query.slice(0, MAX_SEARCH_QUERY_LENGTH);
    const language = classifyQueryLanguage(query);
    const result = [];
    const elasticRes = await client.search({
        index: ELASTIC_INDEX,
        query: {
            match: {
                [language]: query,
            }
        }
    });

    for (const hit of elasticRes.hits.hits) {
        result.push({
            fileName: hit._source.fileName,
            channel: hit._source.channelName,
            message: hit._source.messageId
        });
    }

    return res.send(result);
});

const start = async () => {
    await app.listen(3000, '127.0.0.1');
};

start();
