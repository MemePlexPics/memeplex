import express from 'express';
import process from 'process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import {
    connectToElastic,
    logError,
    getMysqlClient,
} from '../../utils/index.js';
import {
    MAX_SEARCH_QUERY_LENGTH,
    SEARCH_PAGE_SIZE,
    OCR_LANGUAGES,
    TG_API_PARSE_FROM_DATE,
}  from '../../constants/index.js';
import {
    insertChannel,
    selectChannel,
    updateChannelAvailability,
} from '../../utils/mysql-queries/index.js';
import { searchMemes, getLatestMemes, getMeme } from './utils/index.js';
import winston from 'winston';

const app = express();

app.use(express.static('frontend/dist'));
app.use('/data', express.static('data'));
app.use(express.json());

const { client, reconnect } = await connectToElastic();

const logger = winston.createLogger({
    defaultMeta: { service: 'server' },
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
    ),
    transports: [
        new winston.transports.File({
            filename: 'logs/server.log',
            maxsize: 1024*1024*10, // bytes
            maxFiles: 5,
            tailable: true,
        }),
    ],
});

const handleMethodError = async (error) => {
    logError(logger, error);
    if (error.message === 'connect ECONNREFUSED ::1:9200') {
        await reconnect();
    }
};

app.get('/search', async (req, res) => {
    try {
        const query = req.query.query.slice(0, MAX_SEARCH_QUERY_LENGTH);
        const page = parseInt(req.query.page);
        const result = await searchMemes(client, query, page, SEARCH_PAGE_SIZE);
        return res.send(result);
    } catch (e) {
        await handleMethodError(e);
        return res.status(500).send();
    }
});

app.get('/getLatest', async (req, res) => {
    try {
        const { from, to } = req.query;
        const response = await getLatestMemes(client, from, to, SEARCH_PAGE_SIZE);
        return res.send(response);
    } catch (e) {
        await handleMethodError(e);
        return res.status(500).send();
    }
});

app.get('/getMeme', async (req, res) => {
    const { id } = req.query;
    try {
        const meme = await getMeme(client, id);
        return res.send(meme);
    } catch (e) {
        if (e.meta.statusCode === 404) {
            await handleMethodError({ message: `Meme with id "${id}" not found` });
            return res.status(204).send();
        }
        await handleMethodError(e);
        return res.status(500).send(e);
    }
});

app.post('/addChannel', async (req, res) => {
    const { channel, langs, password } = req.body;
    if (!channel || !password)
        return res.status(500).send();
    if (password !== process.env.MEMEPLEX_ADMIN_PASSWORD) {
        logger.error(`${req.ip} got 403 on /admin with this channel: ${channel}`);
        return res.status(403).send();
    }
    if (langs?.find(language => !OCR_LANGUAGES.includes(language))) {
        return res.status(500).send({
            error: `Languages should be comma separated. Allowed languages: ${OCR_LANGUAGES.join(',')}`,
        });
    }
    const languages = langs || ['eng'];
    try {
        const mysql = await getMysqlClient();
        const existedChannel = await selectChannel(mysql, channel);
        if (existedChannel) {
            logger.info(`${req.ip} updated the avialability of @${channel}`);
            await updateChannelAvailability(mysql, channel, true);
        } else {
            logger.info(`${req.ip} added @${channel}`);
            await insertChannel(mysql, channel, languages.join(','), true, TG_API_PARSE_FROM_DATE);
        }
        return res.send();
    } catch(e) {
        await handleMethodError(e);
        return res.status(500).send(e);
    }
});

app.get('/*', async (req, res) => {
    res.sendFile(join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'frontend', 'dist', 'index.html'));
});

const start = async () => {
    app.listen(3080, '127.0.0.1');
    logger.info('Server started');
};

await start();
