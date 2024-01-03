/* global Buffer */
import 'dotenv/config';
import amqplib from 'amqplib';
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
import { delay, loopRetrying } from '../src/utils.js';
import process from 'process';

// yields posts from channelName after timestamp
export const getAfter = async function* (channelName, timestamp) {
    let pageNumber = 0;
    loop: while (true) {
        try {
            const url = (
                process.env.TG_API_ENDPOINT + '/getHistory/?data[peer]=@' + channelName
                    + '&data[limit]=' + TG_API_PAGE_LIMIT
                    + '&data[add_offset]=' + (pageNumber * TG_API_PAGE_LIMIT)
            );
            console.log('checking', 'https://t.me/' + channelName);
            const response = await fetch(url);
            const messages = (await response.json()).response.messages;

            for (const message of messages) {
                if (message.date <= timestamp) {
                    // assuming they are ordered by message.date, decreasing
                    break loop;
                }
                const messageId = message.id;
                if (!message.media || !message.media.photo) { continue; }
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
            console.error(e);
        }
        await delay(TG_API_RATE_LIMIT);
    }
};

const main = async () => {
    const conn = await amqplib.connect(process.env.AMQP_ENDPOINT);

    const sendImageDataCh = await conn.createChannel();

    await loopRetrying(async () => {
        const channels = await getTrackedChannels();
        console.log('fetching channels:', channels);

        for (const channel of channels) {
            const channelName = channel.name;
            let lastTs = await getChannelLastTimestamp(channelName);

            for await (const entry of getAfter(channelName, lastTs)) {
                console.log('new post image:', entry);
                sendImageDataCh.sendToQueue(
                    AMQP_IMAGE_DATA_CHANNEL,
                    Buffer.from(JSON.stringify({
                        ...entry,
                        languages: channel.languages
                    })),
                    { persistent: true }
                );
                lastTs = Math.max(entry.date, lastTs);
            }

            await setChannelLastTimestamp(channelName, lastTs);
        }

        console.log('fetched all channels, sleeping');
        await delay(CYCLE_SLEEP_TIMEOUT);
    });
};

main();
