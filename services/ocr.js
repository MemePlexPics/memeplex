// Listens for messages containing images, outputs messages containing OCR'd text
import 'dotenv/config';
import fs from 'fs/promises';
import process from 'process';
import amqplib from 'amqplib';
import {
    AMQP_IMAGE_FILE_CHANNEL,
    ELASTIC_INDEX
} from '../src/const.js';
import {
    processText,
    recognizeTextOcrSpace,
    buildImageTextPath,
} from '../src/ocr-images.js';
import { delay, getElasticClient } from '../src/utils.js';

const client = await getElasticClient();

const main = async () => {
    const conn = await amqplib.connect(process.env.AMQP_ENDPOINT);

    const receiveImageFileCh = await conn.createChannel();

    await receiveImageFileCh.assertQueue(AMQP_IMAGE_FILE_CHANNEL, { durable: true });
    await receiveImageFileCh.prefetch(1); // let it process one message at a time

    receiveImageFileCh.consume(AMQP_IMAGE_FILE_CHANNEL, async (msg) => {
        if (msg === null) {
            console.log('Consumer cancelled by server');
            return;
        }

        const payload = JSON.parse(msg.content.toString());

        // ocr using all the languages
        const texts = [];

        for (const language of payload.languages) {
            let rawText;

            for (;;) {
                try {
                    rawText = await recognizeTextOcrSpace(payload.fileName, language);
                    break;
                } catch (e) {
                    console.error(e);
                    await delay(36_000);
                }
            }

            const text = processText(rawText);
            if (text) {
                texts.push({ language, text });
                const textFile = await buildImageTextPath(payload, language);
                const textContents = text;
                await fs.writeFile(textFile, textContents);
                console.log('recognized text:', language, rawText);
            }
        }

        // insert new document to elastic
        const doc = {
            fileName: payload.fileName,
            channelName: payload.channelName,
            messageId: payload.messageId,
        };

        for (const text of texts) {
            doc[text.language] = text.text;
        }

        await client.index({
            index: ELASTIC_INDEX,
            document: doc,
        });

        receiveImageFileCh.ack(msg);
    });
};

main();
