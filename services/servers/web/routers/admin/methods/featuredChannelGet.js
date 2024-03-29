import { getMysqlClient } from '../../../../../../utils';
import { getFeaturedChannel } from '../../../../../../utils/mysql-queries';
import { setLogAction } from '../utils';

export const featuredChannelGet = async (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(500).send();
    const mysql = await getMysqlClient();
    const response = await getFeaturedChannel(mysql, username);
    mysql.close();
    setLogAction(res, `👁‍ @${username}`);
    return res.send(response);
};
