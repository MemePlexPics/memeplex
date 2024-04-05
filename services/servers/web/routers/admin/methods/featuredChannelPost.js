import { getMysqlClient } from '../../../../../../utils';
import { replaceFeaturedChannel } from '../../../../../../utils/mysql-queries';
import { setLogAction } from '../utils';

export const featuredChannelPost = async (req, res) => {
    const { username, title, comment, timestamp } = req.body;
    if (!username || !title) return res.status(500).send();
    const mysql = await getMysqlClient();
    const response = await replaceFeaturedChannel(
        mysql,
        username,
        title,
        comment,
        timestamp,
    );
    await mysql.end();
    if (!response)
        throw new Error(`Featured channel @${username} wasn't added`);
    setLogAction(res, `➕ Added featured channel @${username}`);
    return res.send();
};
