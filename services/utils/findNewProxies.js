import { getMysqlClient, getProxySpeed } from '../../utils/index.js';
import { findExistedProxy, insertProxyToDb } from '../../utils/mysql-queries/index.js';
import { getProxies } from './index.js';

export const findNewProxies = async (logger) => {
    let mysql;
    const proxies = await getProxies();
    logger.info(`💬 Proxy list fetched. ${proxies.length} entities`);
    try {
        logger.info('💬 Start testing');

        for (const proxy of proxies) {
            mysql = await getMysqlClient();
            const proxyString = `${proxy.ip}:${proxy.port}`;
            logger.verbose(`💬 Proxy ${proxyString} (${proxy.protocol}) is being checked`);
            const finded = await findExistedProxy(mysql, proxyString, proxy.protocol);
            if (finded) continue;

            const speed = await getProxySpeed(proxy.ip, proxy.port, proxy.protocol, 5, logger);
            if (!speed) continue;
            await insertProxyToDb(mysql, proxyString, proxy.protocol, !!speed, speed);
            logger.verbose(`✅ Proxy ${proxyString} (${proxy.protocol}) inserted into DB`);
        }
        logger.info('💬 Testing completed');
    } finally {
        mysql.end();
    }
};
