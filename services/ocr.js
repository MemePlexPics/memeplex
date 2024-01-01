// Listens for messages containing images, outputs messages containing OCR'd text
import 'dotenv/config';
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
import fs from 'fs/promises';
import process from 'process';
import { getElasticClient } from './utils.js';

const client = await getElasticClient();

const main = async () => {
    const conn = await amqplib.connect(process.env.AMQP_ENDPOINT);

    const receiveImageFileCh = await conn.createChannel();

    await receiveImageFileCh.assertQueue(AMQP_IMAGE_FILE_CHANNEL);

    receiveImageFileCh.consume(AMQP_IMAGE_FILE_CHANNEL, async (msg) => {
        if (msg !== null) {
            const payload = JSON.parse(msg.content.toString());
            const texts = [];
            for (const language of payload.languages) {
                const text = processText(
                    await recognizeTextOcrSpace(payload.fileName, language)
                );
                if (text) {
                    texts.push({ language, text });
                    const textFile = await buildImageTextPath(payload, language);
                    const textContents = text;
                    await fs.writeFile(textFile, textContents);
                    console.log('recognized:', language, textContents);
                }
            }

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
        } else {
            console.log('Consumer cancelled by server');
        }
    });
};

main();
