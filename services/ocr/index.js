import 'dotenv/config';
import amqplib from 'amqplib';
import process from 'process';
import {
    AMQP_IMAGE_FILE_CHANNEL,
    ELASTIC_INDEX,
    EMPTY_QUEUE_RETRY_DELAY,
} from '../../constants/index.js';
import { connectToElastic, delay } from '../../utils/index.js';
import { recogniseText, getNewDoc } from './utils/index.js';

// Listens for messages containing images, outputs messages containing OCR'd text
export const ocr = async (logger) => {
    const { client } = await connectToElastic();
    const conn = await amqplib.connect(process.env.AMQP_ENDPOINT);
    const receiveImageFileCh = await conn.createChannel();

    await receiveImageFileCh.assertQueue(AMQP_IMAGE_FILE_CHANNEL, { durable: true });
    await receiveImageFileCh.prefetch(1); // let it process one message at a time

    for (;;) {
        const msg = await receiveImageFileCh.get(AMQP_IMAGE_FILE_CHANNEL);
        if (!msg) {
            logger.info('Queue is empty');
            await delay(EMPTY_QUEUE_RETRY_DELAY);
            continue;
        }
        try {
            const { payload, texts } = await recogniseText(msg, logger);
            await client.index({
                index: ELASTIC_INDEX,
                document: getNewDoc(payload, texts),
            });
            receiveImageFileCh.ack(msg);
        } catch(e) {
            receiveImageFileCh.nack(msg);
            throw e;
        }
    }
};
