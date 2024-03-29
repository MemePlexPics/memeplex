import { ELASTIC_INDEX } from '../../../constants';

export const setChannelMemesState = async (client, channel, state) => {
    const elasticRes = await client.updateByQuery({
        index: ELASTIC_INDEX,
        query: {
            term: {
                channelName: channel,
            },
        },
        script: {
            source: 'ctx._source.state = params.state',
            lang: 'painless',
            params: {
                state: state,
            },
        },
    });

    return elasticRes;
};
