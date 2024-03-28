import { getMysqlClient } from '../../../../../../utils/index.js';
import { proceedChannelSuggestion } from '../../../../../../utils/mysql-queries/index.js';
import { setLogAction } from '../utils/index.js';

export const channelSuggestionProceedPost = async (req, res) => {
    const { channel } = req.body;
    if (!channel) return res.status(500).send();
    const mysql = await getMysqlClient();
    await proceedChannelSuggestion(mysql, channel);
    mysql.close();
    setLogAction(res, `✍️ @${channel}`);
    return res.send();
};
