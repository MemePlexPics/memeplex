import {
    ELASTIC_INDEX,
}  from '../../../src/const.js';

export const getLatestMemes = async (client, from, to, size) => {
    const elasticRes = await client.search({
        index: ELASTIC_INDEX,
        size,
        query: {
            range: {
                timestamp: {
                    gt: from ? `${from}` : undefined,
                    lt: to ? `${to}` : undefined,
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
        response.result.push({
            fileName: hit._source.fileName,
            channel: hit._source.channelName,
            message: hit._source.messageId
        });
    }

    return response;
};
