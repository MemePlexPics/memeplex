/* global Buffer */
import 'dotenv/config';
import { promises as fs } from 'fs';
import process from 'process';
import amqplib from 'amqplib';
import * as imghash from 'imghash';
import {
    AMQP_IMAGE_DATA_CHANNEL,
    AMQP_IMAGE_FILE_CHANNEL,
} from '../src/const.js';
import { checkFileExists } from '../src/utils.js';
import {
    buildImageUrl,
    buildImagePath,
    downloadFile
} from '../src/download-images.js';

const main = async () => {
    const conn = await amqplib.connect(process.env.AMQP_ENDPOINT);

    const sendImageFileCh = await conn.createChannel();
    const receiveImageDataCh = await conn.createChannel();

    await receiveImageDataCh.assertQueue(AMQP_IMAGE_DATA_CHANNEL, { durable: true });

    receiveImageDataCh.consume(AMQP_IMAGE_DATA_CHANNEL, async (msg) => {
        if (msg === null) {
            console.log('Consumer cancelled by server');
            return;
        }

        const payload = JSON.parse(msg.content.toString());
        const url = buildImageUrl(payload);
        const destination = await buildImagePath(payload);
        console.log('new image to download:', payload);
        console.log('downloading:', url, '->', destination);

        try {
            const doesImageExist = await checkFileExists(destination);

            if (doesImageExist) {
                throw new Error("Image already exists: " + destination);
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

                sendImageFileCh.sendToQueue(
                    AMQP_IMAGE_FILE_CHANNEL, Buffer.from(
                        JSON.stringify({
                            ...payload,
                            fileName: destination
                        })),
                    { persistent: true }
                );
            } else {
                // if we have seen this phash, skip the image and remove
                // the downloaded file
                await fs.unlink(destination);
            }
        } catch (e) {
            console.error(e);
        }

        receiveImageDataCh.ack(msg);
    });
};

main();
