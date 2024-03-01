import 'dotenv/config';
import amqplib from 'amqplib';
import process from 'process';
import {
    AMQP_IMAGE_FILE_CHANNEL,
    ELASTIC_INDEX,
    EMPTY_QUEUE_RETRY_DELAY,
} from '../../constants/index.js';
import { getElasticClient, delay } from '../../utils/index.js';
import { recogniseText, getNewDoc } from './utils/index.js';

// Listens for messages containing images, outputs messages containing OCR'd text
export const ocr = async (logger) => {
    let elastic, amqp, receiveImageFileCh;
    let msg;
    try {
        elastic = getElasticClient();
        amqp = await amqplib.connect(process.env.AMQP_ENDPOINT);
        receiveImageFileCh = await amqp.createChannel();

        await receiveImageFileCh.assertQueue(AMQP_IMAGE_FILE_CHANNEL, { durable: true });
        await receiveImageFileCh.prefetch(1); // let it process one message at a time

        for (;;) {
            msg = await receiveImageFileCh.get(AMQP_IMAGE_FILE_CHANNEL);
            if (!msg) {
                logger.info('Queue is empty');
                await delay(EMPTY_QUEUE_RETRY_DELAY);
                continue;
            }
            const { payload, texts } = await recogniseText(msg, logger);
            if (texts.eng) {
                await elastic.index({
                    index: ELASTIC_INDEX,
                    document: getNewDoc(payload, texts),
                });
            }
            receiveImageFileCh.ack(msg);
        }
    } catch(e) {
        if (!msg)
            return;
        receiveImageFileCh.nack(msg);
        throw e;
    } finally {
        if (receiveImageFileCh) receiveImageFileCh.close();
        if (amqp) amqp.close();
        if (elastic) elastic.close();
    }
};
