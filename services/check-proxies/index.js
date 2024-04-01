import 'dotenv/config';
import amqplib from 'amqplib';
import process from 'process';
import {
    AMQP_CHECK_PROXY_CHANNEL,
    EMPTY_QUEUE_RETRY_DELAY,
} from '../../constants';
import { delay, getMysqlClient } from '../../utils';
import { handleAddingProxy, maintaneProxies } from './utils';
import { handleNackByTimeout } from '../utils/handleNackByTimeout';

export const checkProxies = async (logger) => {
    let amqp, checkProxyCh, timeoutId;
    try {
        amqp = await amqplib.connect(process.env.AMQP_ENDPOINT);
        checkProxyCh = await amqp.createChannel();

        await checkProxyCh.assertQueue(AMQP_CHECK_PROXY_CHANNEL, {
            durable: true,
        });
        await checkProxyCh.prefetch(1); // let it process one message at a time
        checkProxyCh
            .on('close', () => clearTimeout(timeoutId))
            .on('ack', () => clearTimeout(timeoutId))
            .on('nack', () => clearTimeout(timeoutId));

        const ipWithoutProxyResponse = await fetch('https://api64.ipify.org');
        const ipWithoutProxy = await ipWithoutProxyResponse.text();

        for (;;) {
            const mysql = await getMysqlClient();
            await maintaneProxies(mysql, ipWithoutProxy, logger);
            mysql.close();
            const msg = await checkProxyCh.get(AMQP_CHECK_PROXY_CHANNEL);
            if (!msg) {
                await delay(EMPTY_QUEUE_RETRY_DELAY);
                continue;
            }
            timeoutId = setTimeout(
                () => handleNackByTimeout(logger, msg, checkProxyCh),
                600_000,
            );

            const { action, ...payload } = JSON.parse(msg.content.toString());

            if (action === 'add') {
                const { proxy } = payload;
                const mysql = await getMysqlClient();
                await handleAddingProxy(mysql, proxy, ipWithoutProxy, logger);
                mysql.close();
            }
            checkProxyCh.ack(msg);
        }
    } finally {
        clearTimeout(timeoutId);
        if (checkProxyCh) checkProxyCh.close();
        if (amqp) amqp.close();
    }
};
