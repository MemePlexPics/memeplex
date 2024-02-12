import {
    ELASTIC_INDEX,
    ELASTIC_FUZZINESS,
    ELASTIC_PAGE_SIZE
} from '../constants/index.js';

export const buildElasticQuery = (query, page=0) => {
    return {
        index: ELASTIC_INDEX,
        body: {
            query: {
                match: {
                    eng: {
                        query,
                        fuzziness: ELASTIC_FUZZINESS,
                    },
                },
            },
            size: ELASTIC_PAGE_SIZE,
            from: page * ELASTIC_PAGE_SIZE,
        }
    };
};
