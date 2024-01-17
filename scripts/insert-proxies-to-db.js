import axios from 'axios';
import  { performance } from 'perf_hooks';

import { getMysqlClient } from '../src/utils.js';
import { PROXY_TEST_TIMEOUT } from '../src/const.js';

const PROXIES_API_URL = 'https://api.proxyscrape.com/v3/free-proxy-list/get?request=displayproxies&proxy_format=ipport&format=json';
const GOOGLE_LOGO_URL = 'http://www.google.com/images/branding/googlelogo/2x/googlelogo_light_color_272x92dp.png';

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

const testProxySpeed = async ([ip, port]) => {
    const proxy = `${ip}:${port}`;
    try {
        const start = performance.now();
        const response = await axios.get(GOOGLE_LOGO_URL, {
            timeout: PROXY_TEST_TIMEOUT,
            proxy: {
                host: ip,
                port
            }
        });
        const end = performance.now();

        if (response.status != 200)
            throw new Error(`status ${response.status}`, response?.data);

        const speed = parseInt(end - start);
        console.log(`💬 Proxy ${proxy} is working. Speed: ${speed} ms`);

        return speed;
    } catch (error) {
        console.log(`❌ Proxy ${proxy} is not working. Error: ${error.message}`);
        return;
    }
};

const insertProxyToDb = async (address, availability, speed = null, ocr_key = null) => {
    await mysql.execute(`
        REPLACE INTO proxies (
            address,
            availability,
            speed,
            ocr_key
        ) VALUES ("${address}", ${availability}, ${speed}, ${ocr_key})
    `);
};

const findExisted = async (proxy) => {
    const [results] = await mysql.execute(`SELECT * FROM proxies WHERE address = "${proxy}"`);
    if (results.length) return results[0];
    return;
};

export const insertProxiesIntoDb = async () => {
    const proxies = await getProxies();
    console.info(`💬 Proxy list fetched. ${proxies.length} entities`);
    if (!proxies) {
        return;
    }
    try {
        console.info('💬 Start testing');

        for (const proxy of proxies) {
            const proxyString = proxy.join(':');
            const finded = findExisted(proxyString);
            // TODO: Check availability of old ones separately
            if (finded?.availability === 1) {
                console.log(`💬 Proxy ${proxy} skipped (seems to be working)`);
                return;
            }

            const speed = await testProxySpeed(proxy);
            if (!speed) continue;
            await insertProxyToDb(proxyString, !!speed, speed, finded?.ocr_key);
            console.log(`💬 Proxy ${proxy} inserted into DB`);
        }
    } catch(e) {
        console.error('❌', e);
    } finally {
        mysql.end();
    }
};

await insertProxiesIntoDb();
