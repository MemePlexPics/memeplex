/* global Buffer */
import 'dotenv/config';
import { promises as fs } from 'fs';
import amqplib from 'amqplib';
import * as imghash from 'imghash';
import process from 'process';
import {
    AMQP_IMAGE_DATA_CHANNEL,
    AMQP_IMAGE_FILE_CHANNEL,
} from '../src/const.js';
import { checkFileExists, logError } from '../src/utils.js';
import {
    buildImageUrl,
    buildImagePath,
    downloadFile
} from '../src/download-images.js';

const doesFileExist = async (logger, destination, url) => {
    const doesImageExist = await checkFileExists(destination);

    if (doesImageExist) {
        logger.info(`Image already exists: ${destination}`);
        return true;
    }

    await downloadFile(url, destination, logger);

    // compute pHash
    const pHash = await imghash.hash(destination);

    // check if this pHash exists
    const pHashFilePath = './data/phashes/' + pHash;
    const doesExist = await checkFileExists(pHashFilePath);
    if (doesExist) {
        // if we have seen this phash, skip the image and remove
        // the downloaded file
        await fs.unlink(destination);
        return true;
    }
    await fs.writeFile(pHashFilePath, '');
    return false;
};

export const main = async (logger) => {
    const conn = await amqplib.connect(process.env.AMQP_ENDPOINT);
    const sendImageFileCh = await conn.createChannel();
    const receiveImageDataCh = await conn.createChannel();

    await receiveImageDataCh.assertQueue(AMQP_IMAGE_DATA_CHANNEL, { durable: true });

    receiveImageDataCh.consume(AMQP_IMAGE_DATA_CHANNEL, async (msg) => {
        if (msg === null) {
            logger.warn('Consumer cancelled by server');
            return;
        }

        const payloadString = msg.content.toString();
        const payload = JSON.parse(payloadString);
        const url = buildImageUrl(payload);
        const destination = await buildImagePath(payload);
        logger.info(`new image to download: ${payloadString}`);
        logger.info(`downloading: ${url} -> ${destination}`);

        const fileExist = await doesFileExist(logger, destination, url);
        if (!fileExist) {
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

        try {
            receiveImageDataCh.ack(msg);
        } catch(e) {
            logError(logger, e);
        }
    });
};
