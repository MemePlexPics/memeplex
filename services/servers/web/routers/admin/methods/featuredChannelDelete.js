import { getMysqlClient } from '../../../../../../utils/index.js';
import { removeFeaturedChannel } from '../../../../../../utils/mysql-queries/index.js';
import { setLogAction } from '../utils/index.js';

export const featuredChannelDelete = async (req, res) => {
    const { username } = req.body;
    // TODO: Middleware checkParams(channel, password)
    if (!username) return res.status(500).send();
    const mysql = await getMysqlClient();
    await removeFeaturedChannel(mysql, username);
    setLogAction(res, `🗑 Deleted @${username}`);
    return res.send();
};
