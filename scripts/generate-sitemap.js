import fs from 'fs';
import process from 'process';

import { getElasticClient } from '../utils/index.js';
import { ELASTIC_INDEX } from '../constants/index.js';

const client = getElasticClient();
const PUBLIC_PATH = './frontend/src/public';

const getOldestEntityTimestamp = async () => {
    const elasticRes = await client.search({
        index: ELASTIC_INDEX,
        size: 1,
        sort: { timestamp: 'asc' }
    });
    if (elasticRes.hits.hits.length > 0) {
        return elasticRes.hits.hits[0]._source.timestamp;
    }
    return null;
};

const getEntitiesByDay = async (timestamp) => {
    const startOfDay = new Date(timestamp);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(timestamp);
    endOfDay.setHours(23, 59, 59, 999);

    const elasticRes = await client.search({
        index: ELASTIC_INDEX,
        size: 10000, // Assuming not more than 10k entities per day
        body: {
            query: {
                range: {
                    timestamp: {
                        gte: startOfDay.getTime(),
                        lte: endOfDay.getTime()
                    }
                }
            }
        }
    });
    return elasticRes.hits.hits.map(hit => ({ id: hit._id }));
};

//  All formats limit a single sitemap to 50MB (uncompressed) or 50,000 URLs
const createSitemapForDay = async (entities, day) => {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entities.map(entity => `    <url>
        <loc>https://${process.env.MEMEPLEX_WEBSITE_DOMAIN}/memes/${entity.id}</loc>
        <lastmod>${day}</lastmod>
        <changefreq>never</changefreq>
    </url>`).join('\n')}
</urlset>`;
    fs.writeFileSync(`${PUBLIC_PATH}/sitemaps/${day}.xml`, sitemap);
};

const getPageUrlEntity = (path) => {
    return `    <url>
        <loc>https://${process.env.MEMEPLEX_WEBSITE_DOMAIN}/${path}</loc>
    </url>`;
};

const createMainSitemap = (files) => {
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${['channelList','about'].map(path => getPageUrlEntity(path)).join('\n')}
${files.map(file => `    <sitemap>
        <loc>https://${process.env.MEMEPLEX_WEBSITE_DOMAIN}/sitemaps/${file}</loc>
    </sitemap>`).join('\n')}
</sitemapindex>`;
    fs.writeFileSync(`${PUBLIC_PATH}/sitemap.xml`, sitemapIndex);
};

const generateSitemaps = async () => {
    const sitemaps = fs.readdirSync(`${PUBLIC_PATH}/sitemaps`);
    let currentTimestamp;
    if (sitemaps.length) {
        const lastDateStr = sitemaps.at(-1).replace('.xml', '');
        const timeZoneCorrection = new Date().getTimezoneOffset() < 0
            ? 1
            : -1;
        currentTimestamp = new Date(lastDateStr);
        currentTimestamp.setDate(currentTimestamp.getDate() + 1 + timeZoneCorrection);
    } else {
        const oldestTimestamp = await getOldestEntityTimestamp();
        if (!oldestTimestamp) {
            console.log('No entities found in Elasticsearch.');
            return;
        }
        currentTimestamp = new Date(oldestTimestamp * 1000);
    }

    const currentDate = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
    
    while ((currentTimestamp / 1000) < currentDate) {
        const entities = await getEntitiesByDay(currentTimestamp);
        if (entities.length > 0) {
            const day = new Date(currentTimestamp).toISOString().split('T')[0];
            await createSitemapForDay(entities, day);
            sitemaps.push(`${day}.xml`);
        }
        currentTimestamp.setDate(currentTimestamp.getDate() + 1);
    }

    await createMainSitemap(sitemaps);
};

await generateSitemaps();
console.log('Sitemaps generated successfully.');
