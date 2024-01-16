// Listens for messages containing images, outputs messages containing OCR'd text
import 'dotenv/config';
import fs from 'fs/promises';
import amqplib from 'amqplib';
import process from 'process';
import {
    AMQP_IMAGE_FILE_CHANNEL,
    ELASTIC_INDEX,
    OCR_RETRYING_DELAY,
    LOOP_RETRYING_DELAY,
} from '../src/const.js';
import {
    processText,
    recognizeTextOcrSpace,
    buildImageTextPath,
} from '../src/ocr-images.js';
import { connectToElastic, delay, logError, loopRetrying } from '../src/utils.js';

const { client, reconnect } = await connectToElastic();

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

export const main = async (logger) => {
    const conn = await amqplib.connect(process.env.AMQP_ENDPOINT);
    const receiveImageFileCh = await conn.createChannel();

    await receiveImageFileCh.assertQueue(AMQP_IMAGE_FILE_CHANNEL, { durable: true });
    await receiveImageFileCh.prefetch(1); // let it process one message at a time

    receiveImageFileCh.consume(AMQP_IMAGE_FILE_CHANNEL, async (msg) => {
        if (msg === null) {
            logger.warn('Consumer cancelled by server');
            return;
        }
        
        const payload = JSON.parse(msg.content.toString());
        
        // ocr using all the languages
        const texts = [];
        
        for (const language of payload.languages) {
            let rawText;
            
            await loopRetrying(async () => {
                rawText = await recognizeTextOcrSpace(payload.fileName, language);
                return true;
            }, {
                delayMs: OCR_RETRYING_DELAY,
                logger,
            });

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

        // insert new document to elastic
        await loopRetrying(async () => {
            await client.index({
                index: ELASTIC_INDEX,
                document: getNewDoc(payload, texts),
            });
            await delay(LOOP_RETRYING_DELAY);
            return true;
        }, {
            logger,
            afterErrorCallback: async () => await reconnect()
        });
        try {
            receiveImageFileCh.ack(msg);
        } catch(e) {
            logError(logger, e);
        }
    });
};
