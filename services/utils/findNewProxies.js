/* global Buffer */
import process from 'process';
import amqplib from 'amqplib';
import { getMysqlClient } from '../../utils/index.js';
import { findExistedProxy } from '../../utils/mysql-queries/index.js';
import { AMQP_CHECK_PROXY_CHANNEL } from '../../constants/index.js';
import { getProxies } from './index.js';

export const findNewProxies = async (logger) => {
    let amqp, checkProxyCh;
    const proxies = await getProxies();
    logger.info(`💬 Proxy list fetched. ${proxies.length} entities`);
    logger.info('💬 Starting to look for new ones');
    try {
        amqp = await amqplib.connect(process.env.AMQP_ENDPOINT);
        checkProxyCh = await amqp.createChannel();
        for (const proxy of proxies) {
            const mysql = await getMysqlClient();
            const proxyString = `${proxy.ip}:${proxy.port}`;
            const found = await findExistedProxy(
                mysql,
                proxyString,
                proxy.protocol,
            );
            mysql.end();
            if (found) continue;
            logger.verbose(
                `💬 Proxy ${proxyString} (${proxy.protocol}) is being checked`,
            );

            const proxyData = Buffer.from(
                JSON.stringify({ action: 'add', proxy }),
            );
            checkProxyCh.sendToQueue(AMQP_CHECK_PROXY_CHANNEL, proxyData, {
                persistent: true,
            });
        }
        logger.info('💬 Looking completed');
    } finally {
        if (checkProxyCh) checkProxyCh.close();
        if (amqp) amqp.close();
    }
};
