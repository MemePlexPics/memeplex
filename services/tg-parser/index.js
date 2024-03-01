/* global Buffer */
import 'dotenv/config';
import amqplib from 'amqplib';
import {
    AMQP_IMAGE_DATA_CHANNEL,
} from '../../constants/index.js';
import {
    getMysqlClient
} from '../../utils/index.js';
import {
    selectAvailableChannels,
    updateChannelTimestamp,
} from '../../utils/mysql-queries/index.js';
import process from 'process';
import { getMessagesAfter } from './utils/index.js';

export const tgParser = async (logger) => {
    let amqp, sendImageDataCh, mysql;
    try {
        amqp = await amqplib.connect(process.env.AMQP_ENDPOINT);
        mysql = await getMysqlClient({ connectTimeout: 60_000 });
        sendImageDataCh = await amqp.createChannel();

        const channels = await selectAvailableChannels(mysql);
        logger.info(`fetching ${channels.length} channels`);

        for (const { name, /* langs, */ timestamp } of channels) {
            for await (const message of getMessagesAfter(name, timestamp, logger)) {
                logger.verbose(`new post image: ${JSON.stringify(message)}`);
                const imageData = Buffer.from(JSON.stringify({
                    ...message,
                    languages: ['eng'], // langs.split(','),
                }));
                sendImageDataCh.sendToQueue(AMQP_IMAGE_DATA_CHANNEL, imageData, { persistent: true });
                if (message.date > timestamp) await updateChannelTimestamp(mysql, name, message.date);
            }
        }
    } finally {
        if (sendImageDataCh) sendImageDataCh.close();
        if (amqp) amqp.close();
        if (mysql) mysql.close();
    }

    logger.info('fetched all channels, sleeping');
};
