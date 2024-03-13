import fs from 'fs/promises';
import { recogniseTextOcrSpace, buildImageTextPath } from './index.js';

export const recogniseText = async (msg, logger) => {
    const payload = JSON.parse(msg.content.toString());

    // ocr using all the languages
    const texts = {};

    for (const language of payload.languages) {
        let rawText = await recogniseTextOcrSpace(
            payload.fileName,
            language,
            logger,
        );

        if (rawText) {
            texts[language] = rawText;
            const textFile = await buildImageTextPath(payload, language);
            await fs.writeFile(textFile, rawText);
            logger.verbose(`recognized text: ${language} ${rawText}`);
        } else {
            logger.verbose(
                `text wasn't recognized: ${payload.fileName} (${language})`,
            );
        }
    }

    return {
        payload,
        texts,
    };
};
