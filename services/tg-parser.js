/* global Buffer */
import 'dotenv/config';
import {
    CYCLE_SLEEP_TIMEOUT,
    AMQP_IMAGE_DATA_CHANNEL,
    TG_API_PAGE_LIMIT,
    TG_API_RATE_LIMIT
} from '../src/const.js';
import {
    getChannelLastTimestamp,
    setChannelLastTimestamp,
    getTrackedChannels,
} from '../src/channel-watcher.js';
import { delay, loopRetryingAndLogging } from '../src/utils.js';
import process from 'process';

export const getMessagesAfter = async function* (channelName, timestamp, logger) {
    let pageNumber = 0;
    loop: while (true) {
        try {
            const url = (
                process.env.TG_API_ENDPOINT + '/getHistory/?data[peer]=@' + channelName
                    + '&data[limit]=' + TG_API_PAGE_LIMIT
                    + '&data[add_offset]=' + (pageNumber * TG_API_PAGE_LIMIT)
            );
            logger.info(`checking https://t.me/${channelName}`);
            const response = await fetch(url);
            const messages = (await response.json()).response.messages;

            for (const message of messages) {
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
        } catch (e) {
            logger.error(e);
        }
        await delay(TG_API_RATE_LIMIT);
    }
};

export const main = async (conn, logger) => {
    const sendImageDataCh = await conn.createChannel();
    
    const channels = await getTrackedChannels();
    logger.info(`fetching ${channels.length} channels`);

    for (const channel of channels) {
        const channelName = channel.name;
        let lastTs = await getChannelLastTimestamp(channelName);
        for await (const message of getMessagesAfter(channelName, lastTs, logger)) {
            logger.info(`new post image: ${JSON.stringify(message)}`);
            await loopRetryingAndLogging(async () => {
                const imageData = Buffer.from(JSON.stringify({
                    ...message,
                    languages: channel.languages
                }));
                sendImageDataCh.sendToQueue(AMQP_IMAGE_DATA_CHANNEL, imageData, { persistent: true });
                return true;
            }, logger);
            lastTs = Math.max(message.date, lastTs);
        }

        await setChannelLastTimestamp(channelName, lastTs);
    }

    logger.notice('fetched all channels, sleeping');
    await delay(CYCLE_SLEEP_TIMEOUT);
};
