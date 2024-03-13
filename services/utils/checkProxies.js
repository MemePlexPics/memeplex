import { getMysqlClient, getProxySpeed } from '../../utils/index.js';
import { updateProxy } from '../../utils/mysql-queries/index.js';

export const checkProxies = async (logger) => {
    const mysql = await getMysqlClient();
    const [proxies] = await mysql.execute(`
        SELECT * FROM proxies
        ORDER BY
            ocr_key desc,
            availability asc,
            speed asc
    `);
    logger.info(`💬 There are ${proxies.length} unavailable proxies`);
    for (const proxy of proxies) {
        const [ip, port] = proxy.address.split(':');
        const speed = await getProxySpeed(ip, port, proxy.protocol, 5, logger);
        // To avoid losing the last measured speed (was it good proxy or na-h)
        const preservedSpeed = speed || proxy.speed;
        await updateProxy(
            mysql,
            proxy.address,
            proxy.protocol,
            !!speed,
            preservedSpeed,
        );
        logger.verbose(
            `✅ Proxy ${proxy.address} (${proxy.protocol}) updated in DB!`,
        );
    }
    logger.info('💬 All unavailable proxies are checked');
    mysql.end();
};
