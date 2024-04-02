import { ELASTIC_INDEX } from '../../../constants';
import { getMemeResponseEntity } from '.';
import { Client } from '@elastic/elasticsearch';

export const getMeme = async (client: Client, id: string) => {
    const elasticRes = await client.get({
        index: ELASTIC_INDEX,
        id,
    });

    return getMemeResponseEntity(id, elasticRes._source);
};
