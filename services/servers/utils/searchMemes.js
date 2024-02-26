import {
    ELASTIC_INDEX,
    ELASTIC_FUZZINESS,
}  from '../../../constants/index.js';
import { getMemeResponseEntity } from './index.js';

export const searchMemes = async (client, query, page, size) => {
    const from = (page - 1) * size;

    const elasticRes = await client.search({
        index: ELASTIC_INDEX,
        from,
        size,
        query: {
            match: {
                eng: {
                    query,
                    fuzziness: ELASTIC_FUZZINESS,
                },
            }
        }
    });

    const response = {
        result: [],
        totalPages: Math.ceil(elasticRes.hits.total.value / size),
    };
    for (const hit of elasticRes.hits.hits) {
        response.result.push(getMemeResponseEntity(hit._id, hit._source));
    }

    return response;
};
