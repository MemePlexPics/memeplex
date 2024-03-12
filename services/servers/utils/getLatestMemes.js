import {
    ELASTIC_INDEX,
}  from '../../../constants/index.js';
import { getMemeResponseEntity } from './index.js';

export const getLatestMemes = async (client, from, to, size, filtersString) => {
    const filterObject = filtersString ? JSON.parse(filtersString) : null;
    const additionalFilter = {};
    if (filterObject?.channel?.length) {
        ((additionalFilter.must ??= {}).terms ??= {}).channelName = filterObject.channel;
    }
    if (filterObject?.not?.state !== null) {
        ((additionalFilter.must_not ??= {}).term ??= {}).state = filterObject?.state ?? 1;
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
            timestamp: !Number.isInteger(to) && Number.isInteger(from)
                ? 'asc'
                : 'desc',
        },
    });

    const response = {
        result: [],
        from: undefined,
        to: undefined,
        totalPages: Math.ceil(elasticRes.hits.total.value / size),
    };
    for (const hit of elasticRes.hits.hits) {
        const timestamp = hit._source.timestamp;
        if (!response.from || timestamp < response.from) response.from = timestamp;
        if (!response.to || timestamp > response.to) response.to = timestamp;
        response.result.push(getMemeResponseEntity(hit._id, hit._source));
    }

    return response;
};
