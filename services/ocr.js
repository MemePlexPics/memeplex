// Listens for messages containing images, outputs messages containing OCR'd text
import 'dotenv/config';
import fs from 'fs/promises';
import {
    AMQP_IMAGE_FILE_CHANNEL,
    ELASTIC_INDEX
} from '../src/const.js';
import {
    processText,
    recognizeTextOcrSpace,
    buildImageTextPath,
} from '../src/ocr-images.js';
import { getElasticClient, loopRetryingAndLogging } from '../src/utils.js';

const client = await getElasticClient();

const getNewDoc = (payload, texts) => {
    const doc = {
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

export const main = async (conn, logger) => {    
    const receiveImageFileCh = await conn.createChannel();
    
    await receiveImageFileCh.assertQueue(AMQP_IMAGE_FILE_CHANNEL, { durable: true });
    await receiveImageFileCh.prefetch(1); // let it process one message at a time
    
    return receiveImageFileCh.consume(AMQP_IMAGE_FILE_CHANNEL, async (msg) => {
        if (msg === null) {
            logger.notice('Consumer cancelled by server');
            return;
        }

        const payload = JSON.parse(msg.content.toString());

        // ocr using all the languages
        const texts = [];

        for (const language of payload.languages) {
            let rawText;

            await loopRetryingAndLogging(async () => {
                rawText = await recognizeTextOcrSpace(payload.fileName, language);
                return true;
            }, { delayMs: 36_000 });

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
        await loopRetryingAndLogging(async () => {
            await client.index({
                index: ELASTIC_INDEX,
                document: getNewDoc(payload, texts),
            });
            receiveImageFileCh.ack(msg);
            return true;
        }, logger, { suspect: 'elastic' });
    });
};
