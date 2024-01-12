/* global Buffer */
import 'dotenv/config';
import { promises as fs } from 'fs';
import * as imghash from 'imghash';
import {
    AMQP_IMAGE_DATA_CHANNEL,
    AMQP_IMAGE_FILE_CHANNEL,
} from '../src/const.js';
import { checkFileExists, loopRetryingAndLogging } from '../src/utils.js';
import {
    buildImageUrl,
    buildImagePath,
    downloadFile
} from '../src/download-images.js';

export const main = async (conn, logger) => {
    const sendImageFileCh = await conn.createChannel();
    const receiveImageDataCh = await conn.createChannel();

    await receiveImageDataCh.assertQueue(AMQP_IMAGE_DATA_CHANNEL, { durable: true });

    return receiveImageDataCh.consume(AMQP_IMAGE_DATA_CHANNEL, async (msg) => {
        if (msg === null) {
            logger.notice('Consumer cancelled by server');
            return;
        }

        const payloadString = msg.content.toString();
        const payload = JSON.parse(payloadString);
        const url = buildImageUrl(payload);
        const destination = await buildImagePath(payload);
        logger.info(`new image to download: ${payloadString}`);
        logger.info(`downloading: ${url} -> ${destination}`);

        try {
            const doesImageExist = await checkFileExists(destination);

            if (doesImageExist) {
                throw new Error(`Image already exists: ${destination}`);
            }

            await downloadFile(url, destination);

            // compute pHash
            const pHash = await imghash.hash(destination);

            // check if this pHash exists
            const pHashFilePath = './data/phashes/' + pHash;
            const doesExist = await checkFileExists(pHashFilePath);
            if (!doesExist) {
                // if it does not, the image is new: process it
                await fs.writeFile(pHashFilePath, '');
                await loopRetryingAndLogging(async () => {
                    sendImageFileCh.sendToQueue(
                        AMQP_IMAGE_FILE_CHANNEL, Buffer.from(
                            JSON.stringify({
                                ...payload,
                                fileName: destination
                            })),
                        { persistent: true }
                    );
                    return true;
                }, logger);
            } else {
                // if we have seen this phash, skip the image and remove
                // the downloaded file
                await fs.unlink(destination);
            }
        } catch (e) {
            // TODO: Looks a little confusing
            logger.info(e.message);
        }

        receiveImageDataCh.ack(msg);
    });
};
