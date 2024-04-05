import { getMysqlClient } from '../../../../../../utils';
import { proceedChannelSuggestion } from '../../../../../../utils/mysql-queries';
import { setLogAction } from '../utils';

export const channelSuggestionProceedPost = async (req, res) => {
    const { channel } = req.body;
    if (!channel) return res.status(500).send();
    const mysql = await getMysqlClient();
    await proceedChannelSuggestion(mysql, channel);
    await mysql.end();
    setLogAction(res, `✍️ @${channel}`);
    return res.send();
};
