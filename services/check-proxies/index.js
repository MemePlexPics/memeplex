import 'dotenv/config';
import amqplib from 'amqplib';
import process from 'process';
import {
    AMQP_CHECK_PROXY_CHANNEL,
    EMPTY_QUEUE_RETRY_DELAY,
} from '../../constants/index.js';
import { delay, getMysqlClient } from '../../utils/index.js';
import { handleAddingProxy, maintaneProxies } from './utils/index.js';

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
        await checkProxyCh.prefetch(1); // let it process one message at a time

        const ipWithoutProxyResponse = await fetch('https://api64.ipify.org');
        const ipWithoutProxy = await ipWithoutProxyResponse.text();

        for (;;) {
            msg = await checkProxyCh.get(AMQP_CHECK_PROXY_CHANNEL);
            if (!msg) {
                await maintaneProxies(mysql, ipWithoutProxy, logger);
                await delay(EMPTY_QUEUE_RETRY_DELAY);
                continue;
            }

            const { action, ...payload } = JSON.parse(msg.content.toString());

            if (action === 'add') {
                const { proxy } = payload;
                await handleAddingProxy(mysql, proxy, ipWithoutProxy, logger);
            }
            checkProxyCh.ack(msg);
        }
    } finally {
        if (checkProxyCh) checkProxyCh.close();
        if (amqp) amqp.close();
    }
};
