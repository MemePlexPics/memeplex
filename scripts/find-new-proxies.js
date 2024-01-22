import { getMysqlClient, getProxySpeed } from '../src/utils.js';
import { findExistedProxy, insertProxyToDb } from '../src/mysql-queries.js';

const PROXIES_API_URL = 'https://api.proxyscrape.com/v3/free-proxy-list/get?request=displayproxies&proxy_format=ipport&format=json';

const getProxies = async (logger) => {
    try {
        const response = await fetch(PROXIES_API_URL);
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
        logger.error('❌ Error fetching proxies:', error.message);
    }
};

export const findNewProxies = async (logger = console) => {
    const mysql = await getMysqlClient();
    const proxies = await getProxies(logger);
    if (!proxies) {
        return;
    }
    logger.info(`💬 Proxy list fetched. ${proxies.length} entities`);
    try {
        logger.info('💬 Start testing');

        for (const proxy of proxies) {
            const proxyString = `${proxy.ip}:${proxy.port}`;
            logger.info(`💬 Proxy ${proxyString} (${proxy.protocol}) is being checked`);
            const finded = await findExistedProxy(mysql, proxyString, proxy.protocol);
            if (finded) continue;

            const speed = await getProxySpeed(proxy.ip, proxy.port, proxy.protocol, 5);
            if (!speed) continue;
            await insertProxyToDb(mysql, proxyString, proxy.protocol, !!speed, speed);
            logger.info(`✅ Proxy ${proxyString} (${proxy.protocol}) inserted into DB`);
        }
    } catch(e) {
        logger.error('❌', e);
    } finally {
        mysql.end();
    }
};
