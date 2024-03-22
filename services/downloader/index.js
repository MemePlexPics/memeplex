/* global Buffer */
import 'dotenv/config';
import amqplib from 'amqplib';
import process from 'process';
import {
    AMQP_IMAGE_DATA_CHANNEL,
    AMQP_IMAGE_FILE_CHANNEL,
    EMPTY_QUEUE_RETRY_DELAY,
} from '../../constants/index.js';
import { delay } from '../../utils/index.js';
import { handleNackByTimeout } from '../utils/index.js';
import { buildImagePath } from './utils/index.js';
import { isFileIgnored } from './utils/index.js';

export const downloader = async (logger) => {
    let amqp, sendImageFileCh, receiveImageDataCh, timeoutId;
    let msg;
    try {
        amqp = await amqplib.connect(process.env.AMQP_ENDPOINT);
        sendImageFileCh = await amqp.createChannel();
        receiveImageDataCh = await amqp.createChannel();

        await receiveImageDataCh.assertQueue(AMQP_IMAGE_DATA_CHANNEL, {
            durable: true,
        });
        // TODO: incapsulate?
        receiveImageDataCh
            .on('close', () => clearTimeout(timeoutId))
            .on('ack', () => clearTimeout(timeoutId))
            .on('nack', () => clearTimeout(timeoutId));

        for (;;) {
            msg = await receiveImageDataCh.get(AMQP_IMAGE_DATA_CHANNEL);
            if (!msg) {
                await delay(EMPTY_QUEUE_RETRY_DELAY);
                continue;
            }
            timeoutId = setTimeout(
                () => handleNackByTimeout(logger, msg, receiveImageDataCh),
                600_000,
            );
            const payload = JSON.parse(msg.content.toString());
            const destination = await buildImagePath(payload);

            const isIgnored = await isFileIgnored(logger, destination, payload);
            if (!isIgnored) {
                const content = Buffer.from(
                    JSON.stringify({
                        ...payload,
                        fileName: destination,
                    }),
                );
                sendImageFileCh.sendToQueue(AMQP_IMAGE_FILE_CHANNEL, content, {
                    persistent: true,
                });
            }
            receiveImageDataCh.ack(msg);
        }
    } catch (e) {
        if (!msg) return;
        receiveImageDataCh.nack(msg);
        throw e;
    } finally {
        clearTimeout(timeoutId);
        if (sendImageFileCh) sendImageFileCh.close();
        if (receiveImageDataCh) receiveImageDataCh.close();
        if (amqp) amqp.close();
    }
};
