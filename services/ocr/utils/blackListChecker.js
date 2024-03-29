import { getMysqlClient } from '../../../utils';
import { selectBlackList } from '../../../utils/mysql-queries';

// return true if text doesn't contain blocked phrases
export const blackListChecker = async (text) => {
    const mysql = await getMysqlClient();
    const blackList = await selectBlackList(mysql);
    mysql.close();
    const regex = new RegExp(blackList.replace('\n', '|'), 'i');

    return !regex.test(text);
};
