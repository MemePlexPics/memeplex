import { checkProxyArray } from './index.js';

export const maintaneProxies = async (mysql, ipWithoutProxy, logger) => {
    const [proxiesForRecheck] = await mysql.execute(`
        SELECT * FROM proxies
        WHERE
            anonymity != 'transparent'
            AND availability = 1
            AND last_check_datetime <= DATE_SUB(NOW(), INTERVAL 1 HOUR)
        ORDER BY
            last_check_datetime asc,
            ocr_key desc,
            last_activity_datetime desc,
            speed asc
        LIMIT 10
    `);
    const [proxiesForResurrection] = await mysql.execute(`
        SELECT * FROM proxies
        WHERE
            anonymity != 'transparent'
            AND availability = 0
        ORDER BY
            last_check_datetime asc,
            ocr_key desc,
            last_activity_datetime desc,
            speed asc
        LIMIT 100
    `);
    const proxies = [...proxiesForRecheck, ...proxiesForResurrection];
    await checkProxyArray(mysql, proxies, ipWithoutProxy, logger);
};
