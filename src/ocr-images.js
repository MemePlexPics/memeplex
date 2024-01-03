import 'dotenv/config';
import process from 'process';
import { mkdir } from 'fs/promises';
import { ocrSpace } from './ocr-space.js';
import { delay, chooseRandomOCRSpaceKey } from './utils.js';
import { OCR_SPACE_403_DELAY } from './const.js';
import * as R from 'ramda';

export const buildImageTextPath = async ({ channelName, messageId, photoId }, language) => {
    const directory = './data/media/' + channelName + '/';
    await mkdir(directory, { recursive: true });
    return directory + messageId + '-' + photoId + '-' + language +'.txt';
};

export const recognizeTextOcrSpace = async (fileName, language) => {
    let res;
    const apiKey = chooseRandomOCRSpaceKey();
    try {
        res = await ocrSpace(fileName, {
            apiKey,
            language,
            OCREngine: language == 'eng' ? '2' : '1'
            // see here for engine descriptions: http://ocr.space/OCRAPI
        });
        console.log(res);
    } catch(error) {
        if (error?.response?.status === 403) {
            console.log('403 from ocr.space, waiting before retrying...');
            await delay(OCR_SPACE_403_DELAY);
            return await recognizeTextOcrSpace(fileName, language);
        } else {
            console.error(error);
        }
    }

    let text = [];
    for (const result of res.ParsedResults) {
        text.push(result.ParsedText.replace(/\r\n/g, ' '));
    }
    return text.join(' ');
};

function punctuationToSpaces (inputString) {
    const nonAsciiOrCyrillicRegex = /[\u0021-\u0040\u007B-\u007F]/g;

    // Replace non-ASCII and non-Cyrillic characters with an empty string
    return inputString.replace(nonAsciiOrCyrillicRegex, ' ');
}

function filterNonAsciiOrCyrillic(inputString) {
    // Regular expression that matches non-ASCII and non-Cyrillic characters
    const nonAsciiOrCyrillicRegex = /[^\u0000-\u007F\u0410-\u044F]/g;

    // Replace non-ASCII and non-Cyrillic characters with an empty string
    return inputString.replace(nonAsciiOrCyrillicRegex, '');
}

const toWords = text => text.split(/\s/g);

const fromWords = words => words.join(' ');

const lowerCase = string => string.toLowerCase();

const allowedWords = new Set(['ai', 'agi']);

const isLongWord = word => word.length >= 4 || allowedWords.has(word);

export const processText = R.pipe(
    lowerCase,
    punctuationToSpaces,
    filterNonAsciiOrCyrillic,
    toWords,
    R.filter(isLongWord),
    fromWords
);
