import process from 'process';
import 'dotenv/config';
import {
    connectToElastic,
    logError,
} from '../../src/utils.js';
import {
    MAX_SEARCH_QUERY_LENGTH,
    TG_BOT_PAGE_SIZE,
}  from '../../src/const.js';
import { searchMemes, getLatestMemes } from './utils/index.js';
import winston from 'winston';
import { Telegraf, Markup, session } from 'telegraf';
import { message } from 'telegraf/filters';
import rateLimit from 'telegraf-ratelimit';

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

const getTelegramUserName = (ctx) => {
    const { username, first_name, last_name } = ctx.from;
    return username
        ? '@' + username
        : [first_name, last_name].join(' ');
};

const logUserAction = (ctx, text) => {
    const username = getTelegramUserName(ctx);
    logger.info(username + `: ${text}`);
};

const resetSearchSession = (ctx) => {
    ctx.session.search = {
        nextPage: null,
        query: null,
    };
};

const getBotAnswerString = (meme) => {
    const downloadLink = `[(download)](https://${process.env.TELEGRAM_WEBHOOK_DOMAIN}/${meme.fileName})`;
    const tgLink = `https://t.me/${meme.channel}/${meme.message}`;
    return `${downloadLink} [${tgLink}](${tgLink})`;
};

const onBotRecieveText = async (ctx) => {
    try {
        const query = ctx.session.search.query || ctx.update.message.text.slice(0, MAX_SEARCH_QUERY_LENGTH);
        const page = ctx.session.search.nextPage || 1;
        logUserAction(ctx, `${page}: «${query}»`);
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
        logUserAction(ctx, `/get_latest from: ${from} to: ${to}`);
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
    })
}));

bot.use(rateLimit({
    window: 1000*60,
    limit: 15,
    onLimitExceeded: async (ctx) => {
        logUserAction(ctx, 'exceeded rate limit');
        await ctx.reply('Wait a few seconds before trying again');
    },
}));

bot.start(async (ctx) => {
    await ctx.reply(`Welcome to [MemePlex](https://memeplex.pics)!

Send me a text to search memes by caption.`, { parse_mode: 'markdown' }
    );
});

bot.command('get_latest', onBotCommandGetLatest);

bot.on(message('text'), async (ctx) => {
    resetSearchSession(ctx);
    await onBotRecieveText(ctx);
});

bot.action('button_search_more', onBotRecieveText);

bot.action('button_latest_older', (ctx) => onBotCommandGetLatest(ctx, false));

bot.action('button_latest_newer', (ctx) => onBotCommandGetLatest(ctx, true));

const start = async () => {
    bot.launch({
        webhook: {
            domain: process.env.TELEGRAM_WEBHOOK_DOMAIN,
            path: '/tgWebHook',
            port: 3081,
        },
    });
    logger.info('Telegram bot started');
};

await start();
