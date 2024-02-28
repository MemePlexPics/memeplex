import express from 'express';
import process from 'process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import {
    connectToElastic,
    logError,
    getMysqlClient,
    checkFileExists,
} from '../../utils/index.js';
import {
    MAX_SEARCH_QUERY_LENGTH,
    SEARCH_PAGE_SIZE,
    OCR_LANGUAGES,
    TG_API_PARSE_FROM_DATE,
    CHANNEL_LIST_PAGE_SIZE,
}  from '../../constants/index.js';
import {
    insertChannel,
    selectChannel,
    updateChannelAvailability,
    getChannels,
    getChannelsCount,
    insertChannelSuggestion,
    removeChannel,
    proceedChannelSuggestion,
    getChannelSuggestions,
    getChannelSuggestionsCount,
    replaceFeaturedChannel,
    removeFeaturedChannel,
    getFeaturedChannelList,
    getFeaturedChannel,
} from '../../utils/mysql-queries/index.js';
import {
    searchMemes,
    getLatestMemes,
    getMeme,
    downloadTelegramChannelAvatar,
} from './utils/index.js';
import winston from 'winston';

const app = express();

app.use(express.static('frontend/dist'));
app.use('/data/media', express.static('data/media'));
app.use('/data/avatars', express.static('data/avatars'));
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

app.get('/getChannelList', async (req, res) => {
    try {
        const { page, onlyAvailable } = req.query;
        const mysql = await getMysqlClient();
        const channels = await getChannels(mysql, page, onlyAvailable, CHANNEL_LIST_PAGE_SIZE);
        const count = await getChannelsCount(mysql, onlyAvailable);
        return res.send({
            result: channels,
            totalPages: Math.ceil(count / CHANNEL_LIST_PAGE_SIZE),
        });
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
        return res.status(500).send();
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
            await proceedChannelSuggestion(mysql, channel);
        }
        return res.send();
    } catch(e) {
        await handleMethodError(e);
        return res.status(500).send();
    }
});

app.post('/removeChannel', async (req, res) => {
    const { channel, password } = req.body;
    if (!channel || !password)
        return res.status(500).send();
    if (password !== process.env.MEMEPLEX_ADMIN_PASSWORD) {
        logger.error(`${req.ip} got 403 on /admin with this channel: ${channel}`);
        return res.status(403).send();
    }
    try {
        const mysql = await getMysqlClient();
        await removeChannel(mysql, channel);
        return res.send();
    } catch(e) {
        await handleMethodError(e);
        return res.status(500).send();
    }
});

app.post('/addFeaturedChannel', async (req, res) => {
    const { username, title, comment, timestamp, password } = req.body;
    if (!username || !password || !title)
        return res.status(500).send();
    if (password !== process.env.MEMEPLEX_ADMIN_PASSWORD) {
        logger.error(`${req.ip} got 403 on /admin with this channel: ${username}`);
        return res.status(403).send();
    }
    try {
        const mysql = await getMysqlClient();
        const response = await replaceFeaturedChannel(mysql, username, title, comment, timestamp);
        if (!response)
            throw new Error(`Featured channel @${username} wasn't added`);
        logger.info(`${req.ip} added featured channel @${username}`);
        return res.send();
    } catch(e) {
        await handleMethodError(e);
        return res.status(500).send();
    }
});

app.post('/removeFeaturedChannel', async (req, res) => {
    const { username, password } = req.body;
    // TODO: Middleware checkParams(channel, password)
    if (!username || !password)
        return res.status(500).send();
    // TODO: Middleware checkPassword(password)
    if (password !== process.env.MEMEPLEX_ADMIN_PASSWORD) {
        logger.error(`${req.ip} got 403 on /admin with this channel: ${username}`);
        return res.status(403).send();
    }
    try {
        const mysql = await getMysqlClient();
        await removeFeaturedChannel(mysql, username);
        return res.send();
    } catch(e) {
        await handleMethodError(e);
        return res.status(500).send();
    }
});

app.post('/getFeaturedChannel', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(500).send();
    if (password !== process.env.MEMEPLEX_ADMIN_PASSWORD) {
        logger.error(`${req.ip} got 403 on /admin with this channel: ${username}`);
        return res.status(403).send();
    }
    try {
        const mysql = await getMysqlClient();
        const response = await getFeaturedChannel(mysql, username);
        return res.send(response);
    } catch(e) {
        await handleMethodError(e);
        return res.status(500).send();
    }
});

app.get('/getFeaturedChannelList', async (req, res) => {
    try {
        const mysql = await getMysqlClient();
        const channels = await getFeaturedChannelList(mysql);
        return res.send({
            result: channels,
        });
    } catch (e) {
        await handleMethodError(e);
        return res.status(500).send();
    }
});

app.post('/suggestChannel', async (req, res) => {
    const { channel } = req.body;
    if (!channel)
        return res.status(500).send();
    try {
        const mysql = await getMysqlClient();
        const response = await insertChannelSuggestion(mysql, channel);
        if (response) logger.info(`${req.ip} added @${channel} to suggested`);
        return res.send();
    } catch(e) {
        await handleMethodError(e);
        return res.status(500).send();
    }
});

app.post('/proceedChannelSuggestion', async (req, res) => {
    const { channel, password } = req.body;
    if (!channel || !password)
        return res.status(500).send();
    if (password !== process.env.MEMEPLEX_ADMIN_PASSWORD) {
        logger.error(`${req.ip} got 403 on /admin with this channel: ${channel}`);
        return res.status(403).send();
    }
    try {
        const mysql = await getMysqlClient();
        await proceedChannelSuggestion(mysql, channel);
        return res.send();
    } catch(e) {
        await handleMethodError(e);
        return res.status(500).send();
    }
});

app.get('/getChannelSuggestionList', async (req, res) => {
    try {
        const { page } = req.query;
        const mysql = await getMysqlClient();
        const channels = await getChannelSuggestions(mysql, page, CHANNEL_LIST_PAGE_SIZE);
        const count = await getChannelSuggestionsCount(mysql);
        return res.send({
            result: channels,
            totalPages: Math.ceil(count / CHANNEL_LIST_PAGE_SIZE),
        });
    } catch (e) {
        await handleMethodError(e);
        return res.status(500).send();
    }
});

app.get('/data/avatars/:channelName', async (req, res) => {
    try {
        const path = req.originalUrl;
        const isExist = await checkFileExists(path);
        if (!isExist) {
            const [channelName] = req.params.channelName.split('.jpg');
            const destination = await downloadTelegramChannelAvatar(channelName);
            if (destination === false) {
                logger.error(`The avatar for @${channelName} wasn't downloaded`);
                return res.status(204).send();
            }
            if (destination === null)
                return res.status(204).send();
        }
        return res.sendFile(path, { root: './' });
    } catch (e) {
        await handleMethodError(e);
        return res.status(500).send();
    }
});

app.get('/*', async (req, res) => {
    if (['/admin', '/channelList', '/memes', '/about'].some(path => req.originalUrl.includes(path)))
        return res.sendFile(join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'frontend', 'dist', 'index.html'));
    return res.status(404).send();
});

const start = async () => {
    app.listen(3080, '127.0.0.1');
    logger.info('Server started');
};

await start();
