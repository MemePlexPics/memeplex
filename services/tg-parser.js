/* global Buffer */
import 'dotenv/config';
import amqplib from 'amqplib';
import {
    AMQP_IMAGE_DATA_CHANNEL,
    TG_API_PAGE_LIMIT,
    TG_API_RATE_LIMIT,
} from '../src/const.js';
import {
    delay,
    getMysqlClient
} from '../src/utils.js';
import {
    selectAvailableChannels,
    updateChannelTimestamp,
    updateChannelAvailability,
} from '../src/mysql-queries.js';
import process from 'process';

const setChannelUnavailable = async (channelName) => {
    const mysql = await getMysqlClient();
    await updateChannelAvailability(mysql, channelName, false);
};

export const getMessagesAfter = async function* (channelName, timestamp, logger) {
    let pageNumber = 0;
    loop: while (true) {
        const url = (
            process.env.TG_API_ENDPOINT + '/getHistory/?data[peer]=@' + channelName
                + '&data[limit]=' + TG_API_PAGE_LIMIT
                + '&data[add_offset]=' + (pageNumber * TG_API_PAGE_LIMIT)
        );
        logger.verbose(`checking https://t.me/${channelName}`);
        const response = await fetch(url);
        const responseJson = await response.json();
        if (responseJson.success === false) {
            const isDeleted =
                responseJson.errors.length
                && responseJson.errors[0].exception === 'danog\\MadelineProto\\PeerNotInDbException';
            const isInvalid = responseJson.errors[0].message === 'CHANNEL_INVALID';
            if (isDeleted) {
                await setChannelUnavailable(channelName);
                throw new Error(`❌ Channel ${channelName} is not available`);
            }
            if (isInvalid) {
                await setChannelUnavailable(channelName);
                throw new Error(`❌ Channel ${channelName} is: CHANNEL_INVALID (Telegram exception)`);
            }
            throw new Error(`❌ ${channelName} ${timestamp} ${JSON.stringify(responseJson.errors)}`);
        }

        for (const message of responseJson.response.messages) {
            if (message.date <= timestamp) {
                // assuming they are ordered by message.date, decreasing
                break loop;
            }
            const messageId = message.id;
            if (!message.media || !message.media.photo) continue;
            if (message.media.photo.id) {
                yield {
                    channelName,
                    messageId,
                    photoId: message.media.photo.id,
                    date: message.date
                };
            }
        }
        pageNumber++;
        await delay(TG_API_RATE_LIMIT);
    }
};

export const main = async (logger) => {
    const conn = await amqplib.connect(process.env.AMQP_ENDPOINT);
    const mysql = await getMysqlClient();
    const sendImageDataCh = await conn.createChannel();

    const channels = await selectAvailableChannels(mysql);
    logger.info(`fetching ${channels.length} channels`);

    for (const { name, langs, timestamp } of channels) {
        for await (const message of getMessagesAfter(name, timestamp, logger)) {
            logger.verbose(`new post image: ${JSON.stringify(message)}`);
            const imageData = Buffer.from(JSON.stringify({
                ...message,
                languages: langs.split(','),
            }));
            sendImageDataCh.sendToQueue(AMQP_IMAGE_DATA_CHANNEL, imageData, { persistent: true });
            if (message.date > timestamp) await updateChannelTimestamp(mysql, name, message.date);
        }
    }

    logger.info('fetched all channels, sleeping');
};
