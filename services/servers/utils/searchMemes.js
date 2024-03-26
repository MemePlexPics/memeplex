import { ELASTIC_INDEX, ELASTIC_FUZZINESS } from '../../../constants/index.js';
import { getMemeResponseEntity } from './index.js';

export const searchMemes = async (client, query, page, size, abortController) => {
    const from = (page - 1) * size;

    const elasticRes = await client.search({
        index: ELASTIC_INDEX,
        from,
        size,
        query: {
            bool: {
                must_not: [
                    {
                        match: {
                            state: 1, // we hide soft-deleted memes
                        },
                    },
                ],
                minimum_should_match: 1,
                should: [
                    {
                        constant_score: {
                            filter: {
                                match_phrase: {
                                    eng: {
                                        query,
                                    },
                                },
                            },
                            boost: 60,
                        },
                    },
                    {
                        constant_score: {
                            filter: {
                                match: {
                                    eng: {
                                        query,
                                        fuzziness: ELASTIC_FUZZINESS,
                                    },
                                },
                            },
                            boost: 30,
                        },
                    },
                    {
                        constant_score: {
                            filter: {
                                match: {
                                    eng: {
                                        query,
                                    },
                                },
                            },
                            boost: 10, // +10 points to previous 90, 100 points documents will be on top
                        },
                    },
                ],
            },
        },
    }, abortController ? { signal: abortController.signal } : {});

    const response = {
        result: [],
        total: elasticRes.hits.total.value,
        totalPages: Math.ceil(elasticRes.hits.total.value / size),
    };
    for (const hit of elasticRes.hits.hits) {
        response.result.push(getMemeResponseEntity(hit._id, hit._source));
    }

    return response;
};
