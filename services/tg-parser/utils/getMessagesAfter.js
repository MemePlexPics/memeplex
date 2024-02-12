import 'dotenv/config';
import {
    TG_API_PAGE_LIMIT,
    TG_API_RATE_LIMIT,
} from '../../../constants/index.js';
import {
    delay,
} from '../../../utils/index.js';
import process from 'process';
import { setChannelUnavailable } from './index.js';

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
