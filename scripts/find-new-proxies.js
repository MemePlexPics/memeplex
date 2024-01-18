import { getMysqlClient, getProxySpeed } from '../src/utils.js';
import { findExisted, insertProxyToDb } from '../src/mysql-queries.js';

const PROXIES_API_URL = 'https://api.proxyscrape.com/v3/free-proxy-list/get?request=displayproxies&proxy_format=ipport&format=json';

const mysql = await getMysqlClient();

const getProxies = async () => {
    try {
        const response = await fetch(PROXIES_API_URL);
        const proxies = (await response.json()).proxies;
        return proxies
            .filter(proxy => proxy.alive && proxy.protocol === 'http')
            .sort((a, b) => a.timeout - b.timeout)
            .map(data => [data.ip, data.port]);
    } catch (error) {
        console.error('❌ Error fetching proxies:', error.message);
    }
};

export const findNewProxies = async () => {
    const proxies = await getProxies();
    console.info(`💬 Proxy list fetched. ${proxies.length} entities`);
    if (!proxies) {
        return;
    }
    try {
        console.info('💬 Start testing');

        for (const proxy of proxies) {
            const [ip, port] = proxy;
            const proxyString = proxy.join(':');
            const finded = findExisted(mysql, proxyString);
            if (finded) return;

            const speed = await getProxySpeed(ip, port);
            if (!speed) continue;
            await insertProxyToDb(mysql, proxyString, !!speed, speed);
            console.log(`💬 Proxy ${proxyString} inserted into DB`);
        }
    } catch(e) {
        console.error('❌', e);
    } finally {
        mysql.end();
    }
};
