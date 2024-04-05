import 'dotenv/config';
import { getMysqlClient } from '../../../utils';
import { updateChannelAvailability } from '../../../utils/mysql-queries';

export const setChannelUnavailable = async (channelName) => {
    const mysql = await getMysqlClient();
    await updateChannelAvailability(mysql, channelName, false);
    await mysql.end();
};
