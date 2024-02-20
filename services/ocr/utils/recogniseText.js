import fs from 'fs/promises';
import {
    processText,
    recognizeTextOcrSpace,
    buildImageTextPath,
} from './index.js';

export const recogniseText = async (msg, logger) => {
    const payload = JSON.parse(msg.content.toString());

    // ocr using all the languages
    const texts = [];

    for (const language of payload.languages) {
        let rawText = await recognizeTextOcrSpace(payload.fileName, language, logger);

        const text = processText(rawText);
        if (text) {
            texts.push({ language, text, rawText });
            const textFile = await buildImageTextPath(payload, language);
            await fs.writeFile(textFile, text);
            logger.verbose(`recognized text: ${language} ${rawText}`);
        } else {
            logger.verbose(`text wasn't recognized: ${payload.fileName} (${language})`);
        }
    }

    return {
        payload,
        texts,
    };
};
