import 'dotenv/config';
import { getMysqlClient } from '../../../utils/index.js';
import { updateChannelAvailability } from '../../../utils/mysql-queries/index.js';

export const setChannelUnavailable = async (channelName) => {
    const mysql = await getMysqlClient();
    await updateChannelAvailability(mysql, channelName, false);
    mysql.close();
};
