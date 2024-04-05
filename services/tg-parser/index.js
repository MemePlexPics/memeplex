/* global Buffer */
import 'dotenv/config';
import amqplib from 'amqplib';
import { AMQP_IMAGE_DATA_CHANNEL } from '../../constants';
import { getMysqlClient } from '../../utils';
import {
    selectAvailableChannels,
    updateChannelTimestamp,
} from '../../utils/mysql-queries';
import process from 'process';
import { getMessagesAfter } from './utils';

export const tgParser = async (logger) => {
    let amqp, sendImageDataCh;
    try {
        amqp = await amqplib.connect(process.env.AMQP_ENDPOINT);
        sendImageDataCh = await amqp.createChannel();

        const mysql = await getMysqlClient();
        const channels = await selectAvailableChannels(mysql);
        await mysql.end();
        logger.info(`fetching ${channels.length} channels`);

        for (const { name, /* langs, */ timestamp } of channels) {
            for await (const message of getMessagesAfter(
                name,
                timestamp,
                logger,
            )) {
                logger.verbose(`new post image: ${JSON.stringify(message)}`);
                const imageData = Buffer.from(
                    JSON.stringify({
                        ...message,
                        languages: ['eng'], // langs.split(','),
                    }),
                );
                sendImageDataCh.sendToQueue(
                    AMQP_IMAGE_DATA_CHANNEL,
                    imageData,
                    { persistent: true },
                );
                if (message.date > timestamp) {
                    const mysql = await getMysqlClient();
                    await updateChannelTimestamp(mysql, name, message.date);
                    await mysql.end();
                }
            }
        }
    } finally {
        if (sendImageDataCh) sendImageDataCh.close();
        if (amqp) amqp.close();
    }

    logger.info('fetched all channels, sleeping');
};
