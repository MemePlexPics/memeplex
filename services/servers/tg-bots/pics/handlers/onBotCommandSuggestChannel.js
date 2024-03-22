import {
    getMysqlClient,
    getTgChannelName,
    logError,
} from '../../../../../utils/index.js';
import { insertChannelSuggestion } from '../../../../../utils/mysql-queries/index.js';
import { logUserAction } from '../utils/index.js';

export const onBotCommandSuggestChannel = async (ctx, logger) => {
    const { payload } = ctx;
    const channelName = getTgChannelName(payload.trim());
    if (!channelName)
        return ctx.reply(`You must specify the channel name:
/suggest_channel name`);
    try {
        const mysql = await getMysqlClient();
        const response = await insertChannelSuggestion(mysql, channelName);
        if (response)
            logUserAction(ctx.from, { info: `suggested @${channelName}` }, logger);
        return ctx.reply('Thank you for the suggestion!');
    } catch (e) {
        logError(logger, e);
        await ctx.reply('An error occurred, please try again later');
    }
};
