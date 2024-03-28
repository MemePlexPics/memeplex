import { getMysqlClient } from '../../../utils/index.js';
import { selectBlackList } from '../../../utils/mysql-queries/index.js';

// return true if text doesn't contain blocked phrases
export const blackListChecker = async (text) => {
    const mysql = await getMysqlClient();
    const blackList = await selectBlackList(mysql);
    mysql.close();
    if (!blackList) return true;
    const regex = new RegExp(blackList.replace('\n', '|'), 'i');

    return !regex.test(text);
};
