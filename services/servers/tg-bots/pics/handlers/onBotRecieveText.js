import { Markup } from 'telegraf';

import { MAX_SEARCH_QUERY_LENGTH, TG_BOT_PAGE_SIZE } from '../../../../../constants/index.js';
import { logError } from '../../../../../utils/index.js';
import { searchMemes } from '../../../utils/searchMemes.js';
import { getBotAnswerString, logUserAction, resetSearchSession } from '../utils/index.js';

export const onBotRecieveText = async (ctx, client, logger) => {
    try {
        const query =
            ctx.session.search.query ||
            ctx.update.message.text.slice(0, MAX_SEARCH_QUERY_LENGTH);
        const page = ctx.session.search.nextPage || 1;
        logUserAction(ctx.from, {
            search: {
                query,
                page,
            },
        });
        const response = await searchMemes(
            client,
            query,
            page,
            TG_BOT_PAGE_SIZE,
        );

        if (response.totalPages === 0) {
            await ctx.reply('Nothing found');
            return;
        }
        for (let meme of response.result) {
            await ctx.reply(getBotAnswerString(meme), {
                parse_mode: 'markdown',
            });
        }
        if (page < response.totalPages) {
            await ctx.reply(
                `Page ${page} of ${response.totalPages}`,
                Markup.inlineKeyboard([
                    Markup.button.callback('Load more', 'button_search_more'),
                ]),
            );
            ctx.session.search = {
                nextPage: page + 1,
                query: query,
            };
            return;
        }
        resetSearchSession(ctx);
    } catch (e) {
        logError(logger, e);
        await ctx.reply('An error occurred, please try again later');
    }
};
