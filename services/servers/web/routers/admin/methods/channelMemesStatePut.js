import { setChannelMemesState } from '../../../../utils/index.js';
import { setLogAction } from '../utils/index.js';

export const channelMemesStatePut = async (req, res) => {
    const client = req.app.get('elasticClient');
    const { channel, state } = req.body;
    if (!channel || !state)
        return res.status(500).send();
    await setChannelMemesState(client, channel, state);
    const emoji = {
        0: '👁‍',
        1: '🫣',
    };
    setLogAction(res, `${emoji[state]} ${channel}`);
    return res.send();
};
