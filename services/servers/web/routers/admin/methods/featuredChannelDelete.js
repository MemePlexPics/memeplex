import { getMysqlClient } from '../../../../../../utils';
import { removeFeaturedChannel } from '../../../../../../utils/mysql-queries';
import { setLogAction } from '../utils';

export const featuredChannelDelete = async (req, res) => {
    const { username } = req.body;
    // TODO: Middleware checkParams(channel, password)
    if (!username) return res.status(500).send();
    const mysql = await getMysqlClient();
    await removeFeaturedChannel(mysql, username);
    mysql.close();
    setLogAction(res, `🗑 Deleted @${username}`);
    return res.send();
};
