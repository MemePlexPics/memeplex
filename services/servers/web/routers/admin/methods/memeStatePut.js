import { setMemeState } from '../../../../utils/index.js';
import { setLogAction } from '../utils/index.js';

export const memeStatePut = async (req, res) => {
    const client = req.app.get('elasticClient');
    const { id, state } = req.body;
    if (!id || !state)
        return res.status(500).send();
    await setMemeState(client, id, state);
    const emoji = {
        0: '👁‍',
        1: '🫣',
    };
    setLogAction(res, `${emoji[state]} ${id}`);
    return res.send();
};
