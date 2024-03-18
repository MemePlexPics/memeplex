import 'dotenv/config';
import amqplib from 'amqplib';
import process from 'process';
import {
    AMQP_CHECK_PROXY_CHANNEL,
    EMPTY_QUEUE_RETRY_DELAY,
} from '../../constants/index.js';
import { delay, getMysqlClient } from '../../utils/index.js';
import { checkProxy } from './utils/index.js';
import { findExistedProxy, insertProxy, updateProxy } from '../../utils/mysql-queries/index.js';

const checkProxyArray = async (mysql, proxies, ipWithoutProxy, logger) => {
    for (const proxy of proxies) {
        const result = await checkProxy(proxy, ipWithoutProxy, logger);
        await updateProxy(
            mysql,
            `${proxy.ip}:${proxy.port}`,
            proxy.protocol,
            result.availability,
            result.anonimity,
            result.speed,
            result.lastCheckDatetime,
        );
    }
};

export const checkProxies = async (logger) => {
    let amqp, checkProxyCh;
    let msg;
    try {
        const mysql = await getMysqlClient();
        amqp = await amqplib.connect(process.env.AMQP_ENDPOINT);
        checkProxyCh = await amqp.createChannel();

        await checkProxyCh.assertQueue(AMQP_CHECK_PROXY_CHANNEL, {
            durable: true,
        });

        const ipWithoutProxyResponse = await fetch('https://api64.ipify.org');
        const ipWithoutProxy = await ipWithoutProxyResponse.text();

        for (;;) {
            msg = await checkProxyCh.get(AMQP_CHECK_PROXY_CHANNEL);
            if (!msg) {
                const [proxiesForRecheck] = await mysql.execute(`
                    SELECT * FROM proxies
                    WHERE
                        anonimity != 'transparent'
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
                        anonimity != 'transparent'
                        AND availability = 0
                    ORDER BY
                        last_check_datetime asc,
                        ocr_key desc,
                        last_activity_datetime desc,
                        speed asc
                    LIMIT 100
                `);
                const proxies = [...proxiesForRecheck, proxiesForResurrection];
                await checkProxyArray(mysql, proxies, ipWithoutProxy, logger);
                await delay(EMPTY_QUEUE_RETRY_DELAY);
                continue;
            }

            const { action, ...payload } = JSON.parse(msg.content.toString());
            if (action === 'add') {
                const { proxy } = payload;
                const proxyString = `${proxy.ip}:${proxy.port}`;
                const finded = await findExistedProxy(
                    mysql,
                    proxyString,
                    proxy.protocol,
                );
                if (!finded) {
                    console.log({ action, ...proxy });
                    const result = await checkProxy(proxy, ipWithoutProxy, logger);
                    await insertProxy(
                        mysql,
                        `${proxy.ip}:${proxy.port}`,
                        proxy.protocol,
                        result.availability,
                        result.anonimity,
                        result.speed,
                        result.lastCheckDatetime,
                    );
                }
            }
            checkProxyCh.ack(msg);
        }
    } finally {
        if (checkProxyCh) checkProxyCh.close();
        if (amqp) amqp.close();
    }
};
