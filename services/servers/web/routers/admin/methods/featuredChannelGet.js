import {
    getMysqlClient,
} from '../../../../../../utils/index.js';
import {
    getFeaturedChannel,
} from '../../../../../../utils/mysql-queries/index.js';
import { setLogAction } from '../utils/index.js';

export const featuredChannelGet = async (req, res) => {
    const { username } = req.body;
    if (!username)
        return res.status(500).send();
    const mysql = await getMysqlClient();
    const response = await getFeaturedChannel(mysql, username);
    setLogAction(res, `👁‍🗨 @${username}`);
    return res.send(response);
};
