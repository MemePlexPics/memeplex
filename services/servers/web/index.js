import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import {
    connectToElastic,
    logError,
    getMysqlClient,
    checkFileExists,
    shuffleArray,
} from '../../../utils';
import {
    MAX_SEARCH_QUERY_LENGTH,
    SEARCH_PAGE_SIZE,
    CHANNEL_LIST_PAGE_SIZE,
} from '../../../constants';
import {
    getChannels,
    getChannelsCount,
    insertChannelSuggestion,
    getChannelSuggestions,
    getChannelSuggestionsCount,
    getFeaturedChannelList,
} from '../../../utils/mysql-queries';
import {
    searchMemes,
    getLatestMemes,
    getMeme,
    downloadTelegramChannelAvatar,
} from '../utils';
import winston from 'winston';
import { adminRouter } from './routers';

const app = express();
const { client, reconnect } = await connectToElastic();

app.use(express.static('frontend/dist'));
app.use('/data/media', express.static('data/media'));
app.use('/data/avatars', express.static('data/avatars'));
app.use(express.json());
app.set('trust proxy', true);
app.set('elasticClient', client);
app.use('/admin', adminRouter);

const logger = winston.createLogger({
    defaultMeta: { service: 'web' },
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
    ),
    transports: [
        new winston.transports.File({
            filename: 'logs/web.log',
            maxsize: 1024 * 1024 * 10, // bytes
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

const handle404 = async (req, res) => {
    if (
        ['/admin', '/channelList', '/memes', '/about'].some((path) =>
            req.originalUrl.includes(path),
        )
    )
        return res.sendFile(
            join(
                dirname(fileURLToPath(import.meta.url)),
                '..',
                '..',
                '..',
                'frontend',
                'dist',
                'index.html',
            ),
        );
    return res.status(404).send();
};

app.use(async (err, req, res, next) => {
    if (err.message === '404') return handle404(req, res);
    await handleMethodError(err);
    return res.status(500).send();
});

app.get('/search', async (req, res) => {
    const query = req.query.query.slice(0, MAX_SEARCH_QUERY_LENGTH);
    const page = parseInt(req.query.page);
    const result = await searchMemes(client, query, page, SEARCH_PAGE_SIZE);
    return res.send(result);
});

app.get('/getLatest', async (req, res) => {
    const { from, to, filters } = req.query;
    const response = await getLatestMemes(
        client,
        from,
        to,
        SEARCH_PAGE_SIZE,
        filters,
    );
    return res.send(response);
});

app.get('/getChannelList', async (req, res) => {
    const { page, onlyAvailable, filter } = req.query;
    const mysql = await getMysqlClient();
    const filters = {
        onlyAvailable,
        name: filter,
    };
    const channels = await getChannels(
        mysql,
        page,
        CHANNEL_LIST_PAGE_SIZE,
        filters,
    );
    const count = await getChannelsCount(mysql, filters);
    mysql.close();
    return res.send({
        result: channels,
        totalPages: Math.ceil(count / CHANNEL_LIST_PAGE_SIZE),
    });
});

app.get('/getMeme', async (req, res) => {
    const { id } = req.query;
    try {
        const meme = await getMeme(client, id);
        return res.send(meme);
    } catch (e) {
        if (e.meta.statusCode === 404) {
            await handleMethodError({
                message: `Meme with id "${id}" not found`,
            });
            return res.status(204).send();
        }
        throw e;
    }
});

app.get('/getFeaturedChannelList', async (req, res) => {
    const mysql = await getMysqlClient();
    const channels = await getFeaturedChannelList(mysql);
    mysql.close();
    return res.send({
        result: shuffleArray(channels),
    });
});

app.post('/suggestChannel', async (req, res) => {
    const { channel } = req.body;
    if (!channel) return res.status(500).send();
    const mysql = await getMysqlClient();
    const response = await insertChannelSuggestion(mysql, channel);
    mysql.close();
    if (response) logger.info(`${req.ip} added @${channel} to suggested`);
    return res.send();
});

app.get('/getChannelSuggestionList', async (req, res) => {
    const { page, filter } = req.query;
    const mysql = await getMysqlClient();
    const filters = { name: filter };
    const channels = await getChannelSuggestions(
        mysql,
        page,
        CHANNEL_LIST_PAGE_SIZE,
        filters,
    );
    const count = await getChannelSuggestionsCount(mysql, filters);
    mysql.close();
    return res.send({
        result: channels,
        totalPages: Math.ceil(count / CHANNEL_LIST_PAGE_SIZE),
    });
});

app.get('/data/avatars/:channelName', async (req, res) => {
    const path = req.originalUrl;
    const isExist = await checkFileExists(path);
    if (!isExist) {
        const [channelName] = req.params.channelName.split('.jpg');
        const destination = await downloadTelegramChannelAvatar(channelName);
        if (destination === false) {
            logger.error(`The avatar for @${channelName} wasn't downloaded`);
            return res.status(204).send();
        }
        if (destination === null) return res.status(204).send();
    }
    return res.sendFile(path, { root: './' });
});

app.get('/*', handle404);

const start = async () => {
    app.listen(3080, '127.0.0.1');
    logger.info('Server started');
};

await start();
