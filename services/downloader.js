/* global Buffer */
import 'dotenv/config';
import { promises as fs } from 'fs';
import amqplib from 'amqplib';
import * as imghash from 'imghash';
import process from 'process';
import {
    AMQP_IMAGE_DATA_CHANNEL,
    AMQP_IMAGE_FILE_CHANNEL,
    EMPTY_QUEUE_RETRY_DELAY,
} from '../src/const.js';
import { selectPHash, insertPHash } from '../src/mysql-queries.js';
import { checkFileExists, delay, getMysqlClient } from '../src/utils.js';
import {
    buildImageUrl,
    buildImagePath,
    downloadFile
} from '../src/download-images.js';

const isFileIgnored = async (logger, destination, payload) => {
    const doesImageExist = await checkFileExists(destination);

    if (doesImageExist) {
        logger.verbose(`Image already exists: ${destination}`);
        return true;
    }

    const url = buildImageUrl(payload);
    logger.verbose(`downloading: ${url} -> ${destination}`);
    // Check if a message has been deleted from a channel
    const isEmpty = await downloadFile(url, destination, logger) === null;
    if (isEmpty)
        return true;

    // compute pHash
    const pHash = await imghash.hash(destination);

    const mysql = await getMysqlClient();
    // check if this pHash exists
    const doesExist = await selectPHash(mysql, pHash);
    // ocr.space has limit 1024 KB
    const fileSize = (await fs.stat(destination)).size;
    if (doesExist || fileSize > 1048576) {
        // if we have seen this phash, skip the image and remove
        // the downloaded file
        await fs.unlink(destination);
        return true;
    }
    await insertPHash(mysql, pHash);
    return false;
};

export const main = async (logger) => {
    const conn = await amqplib.connect(process.env.AMQP_ENDPOINT);
    const sendImageFileCh = await conn.createChannel();
    const receiveImageDataCh = await conn.createChannel();

    await receiveImageDataCh.assertQueue(AMQP_IMAGE_DATA_CHANNEL, { durable: true });

    for (;;) {
        const msg = await receiveImageDataCh.get(AMQP_IMAGE_DATA_CHANNEL);
        if (!msg) {
            logger.info('Queue is empty');
            await delay(EMPTY_QUEUE_RETRY_DELAY);
            continue;
        }
        try {
            const payload = JSON.parse(msg.content.toString());
            const destination = await buildImagePath(payload);

            const isIgnored = await isFileIgnored(logger, destination, payload);
            if (!isIgnored) {
                const content = Buffer.from(JSON.stringify({
                    ...payload,
                    fileName: destination
                }));
                sendImageFileCh.sendToQueue(
                    AMQP_IMAGE_FILE_CHANNEL,
                    content,
                    { persistent: true }
                );
            }
            receiveImageDataCh.ack(msg);
        } catch(e) {
            receiveImageDataCh.nack(msg);
            throw e;
        }
    }
};
