import 'dotenv/config';
import { mkdir } from 'fs/promises';
import { ocrSpace } from './ocr-space.js';
import {
    delay,
    chooseRandomOCRSpaceKey,
    getMysqlClient,
} from './utils.js';
import { saveKeyTimeout, setProxyAvailability } from './mysql-queries.js';
import { OCR_SPACE_403_DELAY } from './const.js';
import * as R from 'ramda';

export const buildImageTextPath = async ({ channelName, messageId, photoId }, language) => {
    const directory = './data/media/' + channelName + '/';
    await mkdir(directory, { recursive: true });
    return directory + messageId + '-' + photoId + '-' + language +'.txt';
};

const handleTimeout = async(mysql, apiKey, timeout) => {
    const delayMs = Math.max(0, new Date(timeout) - new Date());
    console.log(`💬 Key timeout: ${timeout}. Wait ${delayMs/1000} seconds`);
    await delay(delayMs);
    await saveKeyTimeout(mysql, apiKey, null);
};

export const recognizeTextOcrSpace = async (fileName, language) => {
    let res;
    const {
        key: apiKey,
        timeout,
        proxy,
        protocol
    } = await chooseRandomOCRSpaceKey();
    const mysql = await getMysqlClient();
    if (timeout) handleTimeout(mysql, apiKey, timeout);
    try {
        const [host, port] = proxy.split(':');
        res = await ocrSpace(fileName, {
            apiKey,
            language,
            host,
            port,
            protocol,
            OCREngine: language == 'eng' ? '2' : '1'
            // see here for engine descriptions: http://ocr.space/OCRAPI
        });
        console.log('💬', res);
    } catch(error) {
        if (error?.response?.status === 403) {
            // TODO: Find sended timeout field in response
            console.log(`❗️ 403 from ocr.space for key ${apiKey}`, error);
            await saveKeyTimeout(mysql, apiKey, Date.now() + OCR_SPACE_403_DELAY);
        }
        if (error.message === 'socket hang up'
            || error.message === 'connect ETIMEDOUT'
            || error.name === 'AxiosError'
            || error.message.startsWith('connect ECONNREFUSED')
            || error.message.startsWith('read ECONNRESET')
        ) {
            await setProxyAvailability(mysql, proxy, protocol, false);
        }
        throw error;
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
