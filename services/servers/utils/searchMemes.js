import {
    ELASTIC_INDEX,
    ELASTIC_FUZZINESS,
}  from '../../../constants/index.js';
import { classifyQueryLanguage, getMemeResponseEntity } from './index.js';

export const searchMemes = async (client, query, page, size) => {
    const from = (page - 1) * size;
    const language = classifyQueryLanguage(query);

    const elasticRes = await client.search({
        index: ELASTIC_INDEX,
        from,
        size,
        query: {
            match: {
                [language]: {
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
