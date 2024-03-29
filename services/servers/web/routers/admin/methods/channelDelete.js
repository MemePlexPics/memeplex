import { getMysqlClient } from '../../../../../../utils';
import { updateChannelAvailability } from '../../../../../../utils/mysql-queries';
import { setLogAction } from '../utils';

export const channelDelete = async (req, res) => {
    const { channel } = req.body;
    if (!channel) return res.status(500).send();
    const mysql = await getMysqlClient();
    await updateChannelAvailability(mysql, channel, 0);
    mysql.close();
    setLogAction(res, `🗑 ${channel}`);
    return res.send();
};
