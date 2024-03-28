import { ELASTIC_INDEX } from '../../../constants/index.js';
import { getMemeResponseEntity } from './index.js';

export const getLatestMemes = async (client, from, to, size, filtersString) => {
    const filterObject = filtersString ? JSON.parse(filtersString) : null;
    const additionalFilter = {};
    if (filterObject?.channel?.length) {
        additionalFilter.must = {
            terms: {
                channelName: [],
            },
        };
        filterObject.channel.forEach((channel) => {
            if (typeof channel === 'string')
                additionalFilter.must.terms.channelName.push(channel);
        });
    }
    if (filterObject?.not?.state !== null) {
        const state =
            typeof filterObject?.state === 'number' ? filterObject.state : 1;
        additionalFilter.must_not = {
            term: {
                state,
            },
        };
    }
    const elasticRes = await client.search({
        index: ELASTIC_INDEX,
        size,
        query: {
            bool: {
                ...additionalFilter,
                filter: {
                    range: {
                        timestamp: {
                            gt: from ? `${from}` : undefined,
                            lt: to ? `${to}` : undefined,
                        },
                    },
                },
            },
        },
        sort: {
            timestamp:
                !Number.isInteger(to) && Number.isInteger(from)
                    ? 'asc'
                    : 'desc',
        },
    });

    const response = {
        result: [],
        from: undefined,
        to: undefined,
        total: elasticRes.hits.total.value,
        totalPages: Math.ceil(elasticRes.hits.total.value / size),
    };
    for (const hit of elasticRes.hits.hits) {
        const timestamp = hit._source.timestamp;
        if (!response.from || timestamp < response.from)
            response.from = timestamp;
        if (!response.to || timestamp > response.to) response.to = timestamp;
        response.result.push(getMemeResponseEntity(hit._id, hit._source));
    }

    return response;
};
