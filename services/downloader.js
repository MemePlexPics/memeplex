/* global Buffer */
import 'dotenv/config';
import process from 'process';
import amqplib from 'amqplib';
import {
    AMQP_IMAGE_DATA_CHANNEL,
    AMQP_IMAGE_FILE_CHANNEL,
} from '../src/const.js';
import {
    buildImageUrl,
    buildImagePath,
    downloadFile
} from '../src/download-images.js';

const main = async () => {
    const conn = await amqplib.connect(process.env.AMQP_ENDPOINT);

    const sendImageFileCh = await conn.createChannel();
    const receiveImageDataCh = await conn.createChannel();

    await receiveImageDataCh.assertQueue(AMQP_IMAGE_DATA_CHANNEL);

    receiveImageDataCh.consume(AMQP_IMAGE_DATA_CHANNEL, async (msg) => {
        if (msg !== null) {
            const payload = JSON.parse(msg.content.toString());
            const url = buildImageUrl(payload);
            const destination = await buildImagePath(payload);
            console.log('Received:', payload);
            console.log('downloading:', url, '->', destination);
            try {
                await downloadFile(url, destination);
            } catch (e) {
                console.log(e);
                throw e;
            }
            sendImageFileCh.sendToQueue(
                AMQP_IMAGE_FILE_CHANNEL, Buffer.from(
                    JSON.stringify({
                        ...payload,
                        fileName: destination
                    })));
            receiveImageDataCh.ack(msg);
        } else {
            console.log('Consumer cancelled by server');
        }
    });
};

main();
