import { getMysqlClient, getProxySpeed } from '../src/utils.js';
import { findExistedProxy, insertProxyToDb } from '../src/mysql-queries.js';
import { PROXY_LIST_API_URL } from '../src/const.js';

const getProxies = async () => {
    try {
        const response = await fetch(PROXY_LIST_API_URL);
        const proxies = (await response.json()).proxies;
        return proxies
            .filter(proxy =>
                proxy.alive
                && proxy.anonymity !== 'transparent'
            )
            .sort((a, b) => a.timeout - b.timeout)
            .map(data => {
                return {
                    ip: data.ip,
                    port: data.port,
                    protocol: data.protocol,
                };
            });
    } catch (error) {
        throw new Error(`❌ Error fetching proxies: ${error.message}`);
    }
};

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

            const speed = await getProxySpeed(proxy.ip, proxy.port, proxy.protocol, 5);
            if (!speed) continue;
            await insertProxyToDb(mysql, proxyString, proxy.protocol, !!speed, speed);
            logger.verbose(`✅ Proxy ${proxyString} (${proxy.protocol}) inserted into DB`);
        }
        logger.info('💬 Testing completed');
    } finally {
        mysql.end();
    }
};
