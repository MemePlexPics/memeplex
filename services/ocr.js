// Listens for messages containing images, outputs messages containing OCR'd text
import 'dotenv/config';
import fs from 'fs/promises';
import amqplib from 'amqplib';
import process from 'process';
import {
    AMQP_IMAGE_FILE_CHANNEL,
    ELASTIC_INDEX,
    EMPTY_QUEUE_RETRY_DELAY,
} from '../src/const.js';
import {
    processText,
    recognizeTextOcrSpace,
    buildImageTextPath,
} from '../src/ocr-images.js';
import { connectToElastic, delay } from '../src/utils.js';

const { client } = await connectToElastic();

const getNewDoc = (payload, texts) => {
    const doc = {
        timestamp: Math.floor(Date.now() / 1000),
        fileName: payload.fileName,
        channelName: payload.channelName,
        messageId: payload.messageId,
        date: payload.date
    };

    for (const text of texts) {
        doc[text.language] = text.text;
    }

    return doc;
};

const recogniseText = async (msg, logger) => {
    const payload = JSON.parse(msg.content.toString());

    // ocr using all the languages
    const texts = [];

    for (const language of payload.languages) {
        let rawText = await recognizeTextOcrSpace(payload.fileName, language);

        const text = processText(rawText);
        if (text) {
            texts.push({ language, text });
            const textFile = await buildImageTextPath(payload, language);
            const textContents = text;
            await fs.writeFile(textFile, textContents);
            logger.info(`recognized text: ${language} ${rawText}`);
        } else {
            logger.info(`text doesn't recognized: ${payload.fileName} (${language})`);
        }
    }

    return {
        payload,
        texts,
    };
};

export const main = async (logger) => {
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
        const { payload, texts } = await recogniseText(msg, logger);
        await client.index({
            index: ELASTIC_INDEX,
            document: getNewDoc(payload, texts),
        });
        receiveImageFileCh.ack(msg);
    }
};
