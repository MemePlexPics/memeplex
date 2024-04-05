import { getMysqlClient } from '../../../../../../utils';
import {
    OCR_LANGUAGES,
    TG_API_PARSE_FROM_DATE,
} from '../../../../../../constants';
import {
    insertChannel,
    selectChannel,
    updateChannelAvailability,
    proceedChannelSuggestion,
} from '../../../../../../utils/mysql-queries';
import { setLogAction } from '../utils';

export const channelPost = async (req, res) => {
    const { channel, langs } = req.body;
    if (!channel) return res.status(500).send();
    if (langs?.find((language) => !OCR_LANGUAGES.includes(language))) {
        return res.status(500).send({
            error: `Languages should be comma separated. Allowed languages: ${OCR_LANGUAGES.join(',')}`,
        });
    }
    const languages = langs || ['eng'];
    const mysql = await getMysqlClient();
    const existedChannel = await selectChannel(mysql, channel);
    if (existedChannel) {
        setLogAction(res, `⬆️ Updated the avialability of @${channel}`);
        await updateChannelAvailability(mysql, channel, true);
    } else {
        setLogAction(res, `➕ Added @${channel}`);
        await insertChannel(
            mysql,
            channel,
            languages.join(','),
            true,
            TG_API_PARSE_FROM_DATE,
        );
        await proceedChannelSuggestion(mysql, channel);
        await mysql.end();
    }
    return res.send();
};
