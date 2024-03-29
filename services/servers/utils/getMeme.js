import { ELASTIC_INDEX } from '../../../constants';
import { getMemeResponseEntity } from '.';

export const getMeme = async (client, id) => {
    const elasticRes = await client.get({
        index: ELASTIC_INDEX,
        id,
    });

    return getMemeResponseEntity(id, elasticRes._source);
};
