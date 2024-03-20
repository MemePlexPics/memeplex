import process from 'process';

import { TG_INLINE_BOT_PAGE_SIZE } from '../../../../../constants/index.js';
import { searchMemes } from '../../../utils/index.js';
import { logUserAction } from '../utils/index.js';

export const onInlineQuery = async (ctx, page, client, debounceInline) => {
    const query = ctx.inlineQuery.query;

    if (!query) return;

    logUserAction(ctx.inlineQuery.from, {
        inline_search: {
            query,
            page,
            chat_type: ctx.inlineQuery.chat_type,
        },
    });

    const response = await searchMemes(
        client,
        query,
        page,
        TG_INLINE_BOT_PAGE_SIZE,
    );

    const results = response.result.map((meme) => {
        const photo_url = new URL(
            `https://${process.env.MEMEPLEX_WEBSITE_DOMAIN}/${meme.fileName}`,
        ).href;
        return {
            type: 'photo',
            id: meme.id,
            photo_url,
            thumb_url: photo_url,
            // caption: meme.text.eng.substring(0, 1024),
            photo_width: 400,
            photo_height: 400,
        };
    });

    await ctx.answerInlineQuery(results, {
        next_offset: response.totalPages - page > 0 ? page + 1 + '' : '',
    });
    debounceInline[ctx.inlineQuery.from.id] = 0;
};
