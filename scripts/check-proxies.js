import { getMysqlClient, getProxySpeed } from '../src/utils.js';
import { updateProxyInDb } from '../src/mysql-queries.js';

export const checkProxies = async(logger = console) => {
    const mysql = await getMysqlClient();
    const [proxies] = await mysql.execute(`
        SELECT * FROM proxies
        WHERE availability = 0
        ORDER BY
            ocr_key desc,
            availability asc,
            speed asc
    `);
    logger.info(`💬 There are ${proxies.length} unavailable proxies`);
    for (const proxy of proxies) {
        const [ip, port] = proxy.address.split(':');
        const speed = await getProxySpeed(ip, port, proxy.protocol, 5);
        // To avoid losing the last measured speed (was it good proxy or na-h)
        const preservedSpeed = speed || proxy.speed;
        await updateProxyInDb(mysql, proxy.address, proxy.protocol, !!speed, preservedSpeed);
        logger.verbose(`✅ Proxy ${proxy.address} (${proxy.protocol}) updated in DB!`);
    }
    logger.info('💬 All unavailable proxies are checked');
    mysql.end();
};
