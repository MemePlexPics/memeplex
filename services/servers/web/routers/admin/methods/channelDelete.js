import {
    getMysqlClient,
} from '../../../../../../utils/index.js';
import {
    updateChannelAvailability,
} from '../../../../../../utils/mysql-queries/index.js';
import { setAction } from '../utils/index.js';

export const channelDelete = async (req, res) => {
    const { channel } = req.body;
    if (!channel)
        return res.status(500).send();
    const mysql = await getMysqlClient();
    await updateChannelAvailability(mysql, channel, 0);
    setAction(res, `🗑 ${channel}`);
    return res.send();
};
