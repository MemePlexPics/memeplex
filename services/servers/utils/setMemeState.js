import {
    ELASTIC_INDEX,
}  from '../../../constants/index.js';

export const setMemeState = async (client, id, state) => {
    const elasticRes = await client.update({
        index: ELASTIC_INDEX,
        id,
        doc: {
            state,
        }
    });

    return elasticRes;
};
