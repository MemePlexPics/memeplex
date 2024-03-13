import { ELASTIC_INDEX } from '../../../constants/index.js';
import { getMemeResponseEntity } from './index.js';

export const getMeme = async (client, id) => {
    const elasticRes = await client.get({
        index: ELASTIC_INDEX,
        id,
    });

    return getMemeResponseEntity(id, elasticRes._source);
};
