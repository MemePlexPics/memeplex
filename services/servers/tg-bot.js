import process from 'process';
import 'dotenv/config';
import {
    connectToElastic,
    logError,
    getMysqlClient,
    getTgChannelName,
} from '../../utils/index.js';
import {
    MAX_SEARCH_QUERY_LENGTH,
    TG_BOT_PAGE_SIZE,
}  from '../../constants/index.js';
import { searchMemes, getLatestMemes } from './utils/index.js';
import winston from 'winston';
import { Telegraf, Markup, session } from 'telegraf';
import { MySQL } from '@telegraf/session/mysql';
import { message } from 'telegraf/filters';
import rateLimit from 'telegraf-ratelimit';
import {
    insertChannelSuggestion,
    insertBotUser,
    insertBotAction,
    selectBotUser,
} from '../../utils/mysql-queries/index.js';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const { client } = await connectToElastic();

const logger = winston.createLogger({
    defaultMeta: { service: 'tg-bot' },
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
    ),
    transports: [
        new winston.transports.File({
            filename: 'logs/tg-bot.log',
            maxsize: 1024*1024*10, // bytes
            maxFiles: 5,
            tailable: true,
        }),
    ],
});

const getTelegramUser = (ctx) => {
    const { id, username, first_name, last_name } = ctx.from;
    return {
        id,
        user: username
            ? '@' + username
            : [first_name, last_name].join(' '),
    };
};

// { search: { query, page }, latest: { from, to }, info: string, start: any }
const logUserAction = async (ctx, action) => {
    const { id, user } = getTelegramUser(ctx);
    let logEntity = {};
    if (action.search) {
        const mysql = await getMysqlClient();
        const [existedUser] = await selectBotUser(mysql, id);
        if (!existedUser?.id) await insertBotUser(mysql, id, user);
        await insertBotAction(mysql, id, 'search', action.search.query, action.search.page);
        // TODO: remove it after 2024-03-21 (two weeks)?
        logEntity = {
            action: 'search',
            ...action.search,
        };
    } else if (action.latest) {
        const mysql = await getMysqlClient();
        const [existedUser] = await selectBotUser(mysql, id);
        if (!existedUser?.id) await insertBotUser(mysql, id, user);
        await insertBotAction(mysql, id, 'latest', null, [action.latest.from, action.latest.to].join(','));
        // TODO: remove it after 2024-03-21 (two weeks)?
        logEntity = {
            action: 'latest',
            ...action.latest,
        };
    } else if (action.start) {
        const mysql = await getMysqlClient();
        await insertBotUser(mysql, id, user);
        // TODO: remove it after 2024-03-21 (two weeks)?
        logEntity = {
            start: 1,
        };
    } else if (action.info) {
        logEntity = {
            action: 'info',
            text: action.info,
        };
    }
    logger.info({ id, user, ...logEntity });
};

const resetSearchSession = (ctx) => {
    ctx.session.search = {
        nextPage: null,
        query: null,
    };
};

const getBotAnswerString = (meme) => {
    const ourImgLink = new URL(`https://${process.env.MEMEPLEX_WEBSITE_DOMAIN}/${meme.fileName}`).href;
    const downloadLink = `[(download)](${ourImgLink})`;
    const tgLink = `https://t.me/${meme.channel}/${meme.message}`;
    return `${downloadLink} [${tgLink}](${tgLink})`;
};

const onBotRecieveText = async (ctx) => {
    try {
        const query = ctx.session.search.query || ctx.update.message.text.slice(0, MAX_SEARCH_QUERY_LENGTH);
        const page = ctx.session.search.nextPage || 1;
        logUserAction(ctx, { search: {
            query,
            page
        }});
        const response = await searchMemes(client, query, page, TG_BOT_PAGE_SIZE);

        if (response.totalPages === 0) {
            await ctx.reply('Nothing found');
            return;
        }
        for (let meme of response.result) {
            await ctx.reply(getBotAnswerString(meme), { parse_mode: 'markdown' });
        }
        if (page < response.totalPages) {
            await ctx.reply(`Page ${page} of ${response.totalPages}`, Markup.inlineKeyboard([
                Markup.button.callback('Load more', 'button_search_more'),
            ]));
            ctx.session.search = {
                nextPage: page + 1,
                query: query,
            };
            return;
        }
        resetSearchSession(ctx);
    } catch(e) {
        logError(logger, e);
        await ctx.reply('An error occurred, please try again later');
    }
};

const onBotCommandGetLatest = async (ctx, update = true) => {
    try {
        const { from: sessionFrom, to: sessionTo } = ctx.session.latest;
        const from = update ? sessionTo : undefined;
        const to = update ? undefined : sessionFrom;
        logUserAction(ctx, { latest: {
            from,
            to
        }});
        const response = await getLatestMemes(client, from, to, TG_BOT_PAGE_SIZE);

        for (let meme of response.result) {
            await ctx.reply(getBotAnswerString(meme), { parse_mode: 'markdown' });
        }

        if (!sessionFrom || response.from < sessionFrom)
            ctx.session.latest.from = response.from;
        if (!sessionTo || response.to > sessionTo)
            ctx.session.latest.to = response.to;

        const isLastNewPage = update && response.totalPages === 0;
        let finalReplyText = isLastNewPage
            ? 'There are no new memes since last request'
            : `${response.totalPages - 1} more ${update ? 'new pages' : 'pages in the past'}`;
        const buttons = Markup.inlineKeyboard([
            Markup.button.callback('Load newer', 'button_latest_newer'),
            Markup.button.callback('Load older', 'button_latest_older')
        ]);
        await ctx.reply(finalReplyText, buttons);
    } catch(e) {
        logError(logger, e);
        await ctx.reply('An error occurred, please try again later');
    }
};

const onBotCommandSuggestChannel = async (ctx) => {
    const { payload } = ctx;
    const channelName = getTgChannelName(payload.trim());
    if (!channelName)
        return ctx.reply(`You must specify the channel name:
/suggest_channel name`);
    try {
        const mysql = await getMysqlClient();
        const response = await insertChannelSuggestion(mysql, channelName);
        if (response) logUserAction(ctx, { info: `suggested @${channelName}` });
        return ctx.reply('Thank you for the suggestion!');
    } catch(e) {
        logError(logger, e);
        await ctx.reply('An error occurred, please try again later');
    }
};

bot.use(session({
    defaultSession: () => ({
        search: {
            nextPage: null,
            query: null,
        },
        latest: {
            pagesLeft: undefined,
            from: undefined,
            to: undefined,
        },
    }),
    store: MySQL({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_DATABASE,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        table: 'telegraf_sessions',
    }),
}));

bot.use(rateLimit({
    window: 60_000,
    limit: 15,
    onLimitExceeded: async (ctx) => {
        logUserAction(ctx, { info: 'exceeded rate limit' });
        await ctx.reply('Wait a few seconds before trying again');
    },
}));

bot.start(async (ctx) => {
    await ctx.reply(`Welcome to [MemePlex](https://memeplex.pics)!

Send me a text to search memes by caption.`, { parse_mode: 'markdown' }
    );
    logUserAction(ctx, { start: true });
});

bot.command('get_latest', onBotCommandGetLatest);

bot.command('suggest_channel', onBotCommandSuggestChannel);

bot.action('button_search_more', onBotRecieveText);

bot.action('button_latest_older', (ctx) => onBotCommandGetLatest(ctx, false));

bot.action('button_latest_newer', (ctx) => onBotCommandGetLatest(ctx, true));

bot.on(message('text'), async (ctx) => {
    resetSearchSession(ctx);
    await onBotRecieveText(ctx);
});

bot.on('inline_query', async (ctx) => {
    const query = ctx.inlineQuery.query;
    console.log({query});

    // Check if the query is empty or doesn't match bot name
    if (!query || !query.toLowerCase().startsWith('@MemePlexBot')) {
        return;
    }

    const results = [
        {
            type: 'photo',
            id: '1',
            photo_url: 'https://memeplex.pics/data/media/rothkoskimono/5245-5420256235611087000.jpg',
            thumb_url: 'https://memeplex.pics/apple-touch-icon.png',
            title: 'Image 1'
        },
        {
            type: 'photo',
            id: '2',
            photo_file_id: '5426853756349307000',
            title: 'Image 2'
        },
    ];

    await ctx.answerInlineQuery(results);
});

const start = async () => {
    bot.launch({
        webhook: {
            domain: process.env.MEMEPLEX_WEBSITE_DOMAIN,
            path: '/tgWebHook',
            port: 3081,
        },
    });
    logger.info({ info: 'Telegram bot started' });
};

await start();
