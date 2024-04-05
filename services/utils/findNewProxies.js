/* global Buffer */
import process from 'process';
import amqplib from 'amqplib';
import { getMysqlClient } from '../../utils';
import { findExistedProxy } from '../../utils/mysql-queries';
import { AMQP_CHECK_PROXY_CHANNEL } from '../../constants';
import { getProxies } from '.';

export const findNewProxies = async (logger) => {
    let amqp, checkProxyCh;
    const proxies = await getProxies();
    logger.info(`💬 Proxy list fetched. ${proxies.length} entities`);
    logger.info('💬 Starting to look for new ones');
    try {
        amqp = await amqplib.connect(process.env.AMQP_ENDPOINT);
        checkProxyCh = await amqp.createChannel();
        const mysql = await getMysqlClient();
        let notCheckedProxiesCount = proxies.length;
        for (const proxy of proxies) {
            const proxyString = `${proxy.ip}:${proxy.port}`;
            const found = await findExistedProxy(
                mysql,
                proxyString,
                proxy.protocol,
            );
            if (found) {
                notCheckedProxiesCount--;
                continue;
            }

            const proxyData = Buffer.from(
                JSON.stringify({ action: 'add', proxy }),
            );
            // TODO: get rid of the AMQP_CHECK_PROXY_CHANNEL?
            await checkProxyCh.purgeQueue(AMQP_CHECK_PROXY_CHANNEL);
            checkProxyCh.sendToQueue(AMQP_CHECK_PROXY_CHANNEL, proxyData, {
                persistent: true,
            });
        }
        await mysql.end();
        logger.info(
            `💬 Looking completed: ${notCheckedProxiesCount} new proxies to check`,
        );
    } finally {
        if (checkProxyCh) await checkProxyCh.close();
        if (amqp) await amqp.close();
    }
};
