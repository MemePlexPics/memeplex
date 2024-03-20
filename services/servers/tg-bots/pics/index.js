import process from 'process';
import 'dotenv/config';
import {
    connectToElastic,
} from '../../../../utils/index.js';
import winston from 'winston';
import { Telegraf, session } from 'telegraf';
import { MySQL } from '@telegraf/session/mysql';
import { message } from 'telegraf/filters';
import rateLimit from 'telegraf-ratelimit';
import { logUserAction, resetSearchSession } from './utils/index.js';
import { onBotCommandGetLatest, onBotCommandSuggestChannel, onBotRecieveText, onInlineQuery } from './handlers/index.js';
import { defaultSession } from './constants/index.js';

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
            maxsize: 1024 * 1024 * 10, // bytes
            maxFiles: 5,
            tailable: true,
        }),
    ],
});

bot.use(
    session({
        defaultSession: () => defaultSession,
        store: MySQL({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_DATABASE,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            table: 'telegraf_sessions',
        }),
    }),
);

bot.use(
    rateLimit({
        window: 60_000,
        limit: 15,
        onLimitExceeded: async (ctx) => {
            logUserAction(ctx.from, { info: 'exceeded rate limit' });
            await ctx.reply('Wait a few seconds before trying again');
        },
    }),
);

bot.start(async (ctx) => {
    await ctx.reply(
        `Welcome to [MemePlex](https://memeplex.pics)!

Send me a text to search memes by caption.`,
        { parse_mode: 'markdown' },
    );
    logUserAction(ctx.from, { start: true });
});

bot.command('get_latest', (ctx) => onBotCommandGetLatest(ctx, true, client, logger));

bot.command('suggest_channel', (ctx) => onBotCommandSuggestChannel(ctx, logger));

bot.action('button_search_more', (ctx) => onBotRecieveText(ctx, client, logger));

bot.action('button_latest_older', (ctx) => onBotCommandGetLatest(ctx, false, client, logger));

bot.action('button_latest_newer', (ctx) => onBotCommandGetLatest(ctx, true, client, logger));

bot.on(message('text'), async (ctx) => {
    resetSearchSession(ctx);
    await onBotRecieveText(ctx);
});

const debounceInline = {};

bot.on('inline_query', async (ctx) => {
    const page = Number(ctx.inlineQuery.offset) || 1;
    if (debounceInline[ctx.inlineQuery.from.id]) {
        clearTimeout(debounceInline[ctx.inlineQuery.from.id]);
    }
    if (page === 1) {
        debounceInline[ctx.inlineQuery.from.id] = setTimeout(
            () => onInlineQuery(ctx, page, client, debounceInline),
            500,
        );
    } else await onInlineQuery(ctx, page, client, debounceInline);
});

bot.on('chosen_inline_result', async (ctx) => {
    const { query, result_id } = ctx.update.chosen_inline_result;
    logUserAction(ctx.update.chosen_inline_result.from, {
        inline_select: {
            query,
            id: result_id,
        },
    });
});

const start = async () => {
    bot.launch({
        webhook: {
            domain: process.env.MEMEPLEX_WEBSITE_DOMAIN,
            path: '/' + process.env.TELEGRAM_BOT_WEBHOOK_PATH,
            port: 3081,
        },
    });
    logger.info({ info: 'Telegram bot started' });
};

await start();
