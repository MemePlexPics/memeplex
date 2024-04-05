import { getMysqlClient } from '../../../../../utils';
import {
    insertBotAction,
    insertBotInlineAction,
    insertBotInlineUser,
    insertBotUser,
    selectBotInlineUser,
    selectBotUser,
} from '../../../../../utils/mysql-queries';
import { getTelegramUser } from '../../utils';

// TODO: refactoring
// { search: { query, page }, latest: { from, to }, info: string, start: any }
export const logUserAction = async (from, action, logger) => {
    const { id, user } = getTelegramUser(from);
    let logEntity = {};
    if (action.search) {
        const mysql = await getMysqlClient();
        const [existedUser] = await selectBotUser(mysql, id);
        if (!existedUser?.id) await insertBotUser(mysql, id, user);
        await insertBotAction(
            mysql,
            id,
            'search',
            action.search.query,
            action.search.page,
        );
        await mysql.end();
        // TODO: remove it after 2024-03-21 (two weeks)?
        logEntity = {
            action: 'search',
            ...action.search,
        };
    } else if (action.latest) {
        const mysql = await getMysqlClient();
        const [existedUser] = await selectBotUser(mysql, id);
        if (!existedUser?.id) await insertBotUser(mysql, id, user);
        await insertBotAction(
            mysql,
            id,
            'latest',
            null,
            [action.latest.from, action.latest.to].join(','),
        );
        await mysql.end();
        // TODO: remove it after 2024-03-21 (two weeks)?
        logEntity = {
            action: 'latest',
            ...action.latest,
        };
    } else if (action.inline_search) {
        const mysql = await getMysqlClient();
        const [existedUser] = await selectBotInlineUser(mysql, id);
        if (!existedUser?.id) await insertBotInlineUser(mysql, id, user);
        await insertBotInlineAction(
            mysql,
            id,
            'search',
            action.inline_search.query,
            null,
            action.inline_search.page,
            action.inline_search.chat_type,
        );
        await mysql.end();
        // TODO: remove it after 2024-03-21 (two weeks)?
        logEntity = {
            action: 'inline_search',
            ...action.inline_search,
        };
    } else if (action.inline_select) {
        const mysql = await getMysqlClient();
        const [existedUser] = await selectBotInlineUser(mysql, id);
        if (!existedUser?.id) await insertBotInlineUser(mysql, id, user);
        await insertBotInlineAction(
            mysql,
            id,
            'select',
            action.inline_select.query,
            action.inline_select.id,
            null,
            null,
        );
        await mysql.end();
        // TODO: remove it after 2024-03-21 (two weeks)?
        logEntity = {
            action: 'inline_select',
            selected_id: action.inline_select.id,
            ...action.inline_select,
        };
    } else if (action.start) {
        const mysql = await getMysqlClient();
        await insertBotUser(mysql, id, user);
        await mysql.end();
        // TODO: remove it after 2024-03-21 (two weeks)?
        logEntity = {
            start: action.start,
        };
    } else if (action.info) {
        logEntity = {
            action: 'info',
            text: action.info,
        };
    }
    logger.info({ id, user, ...logEntity });
};
