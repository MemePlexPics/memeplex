import { getMysqlClient, getProxySpeed } from '../src/utils.js';
import { updateProxyInDb } from '../src/mysql-queries.js';

export const checkProxies = async() => {
    const mysql = await getMysqlClient();
    const [proxies] = await mysql.execute(`
        SELECT * FROM proxies
        ORDER BY
            ocr_key desc,
            availability asc,
            speed asc
    `);
    console.log(`💬 There are ${proxies.length} unavailable proxies`);
    for (const proxy of proxies) {
        const [ip, port] = proxy.address.split(':');
        const speed = await getProxySpeed(ip, port);
        await updateProxyInDb(mysql, proxy.address, !!speed, speed || proxy.speed);
        console.log(`✅ Proxy ${proxy.address} updated in DB!`);
    }
    console.log('💬 All unavailable proxies are checked');
    mysql.end();
};
