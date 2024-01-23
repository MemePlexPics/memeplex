import express from 'express';
import * as path from 'path';
import 'dotenv/config';
import { connectToElastic, logError } from '../src/utils.js';
import {
    ELASTIC_INDEX,
    MAX_SEARCH_QUERY_LENGTH
}  from '../src/const.js';
import winston from 'winston';

const logger = winston.createLogger({
    defaultMeta: { service: 'server' },
    transports: [
        new winston.transports.File({
            filename: 'logs/server.log',
            lazy: true,
            maxsize: 1024*1024, // bytes
        }),
    ],
});

const app = express();
app.use(express.static('static'));
app.use('/data', express.static('data'));

const { client, reconnect } = await connectToElastic();

export const classifyQueryLanguage = query => {
    const russianCharacters = /[а-яА-Я]/;
    const englishCharacters = /[a-zA-Z]/;
    
    const hasRussian = russianCharacters.test(query);
    const hasEnglish = englishCharacters.test(query);
    
    if (hasRussian) {
        return 'rus';
    } else if (hasEnglish) {
        return 'eng';
    }
    return 'eng';
};

app.get('/search', async (req, res) => {
    const query = req.query.query.slice(0, MAX_SEARCH_QUERY_LENGTH);
    const { from, size } = req.query;
    const language = classifyQueryLanguage(query);
    const result = [];

    try {
        const elasticRes = await client.search({
            index: ELASTIC_INDEX,
            from: parseInt(from),
            size: parseInt(size),
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
        return res.send({
            result,
            total: elasticRes.hits.total.value,
        });
    } catch (e) {
        logError(logger, e);
        if (e.message === 'connect ECONNREFUSED ::1:9200') {
            await reconnect();
        }
        return res.status(500).send();
    }
});

const start = async () => {
    app.listen(3000, '127.0.0.1');
};

start();
