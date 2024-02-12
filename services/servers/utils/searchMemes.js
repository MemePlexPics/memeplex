import {
    ELASTIC_INDEX,
    ELASTIC_FUZZINESS,
}  from '../../../constants/index.js';
import { classifyQueryLanguage } from './index.js';

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
        response.result.push({
            fileName: hit._source.fileName,
            channel: hit._source.channelName,
            message: hit._source.messageId
        });
    }

    return response;
};
