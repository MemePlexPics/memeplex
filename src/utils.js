import 'dotenv/config';
import { Client } from '@elastic/elasticsearch';
import process from 'process';
import { promises as fs } from 'fs';

import { LOOP_RETRYING_DELAY } from './const.js';

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

export const getElasticClient = () => {
    const client = new Client({
        node: process.env.ELASTIC_ENDPOINT,
        auth: {
            username: process.env.ELASTIC_USERNAME,
            password: process.env.ELASTIC_PASSWORD,
        },
        ssl: {
            rejectUnauthorized: false
        }
    });
    return client;
};

export const connectToElastic = async (logger) => {
    const getElasticClientUntilSuccess = async () => {
        let connect;
        await loopRetrying(async () => {
            connect = getElasticClient();
            return true;
        }, { logger });
        return connect;
    };

    let client = await getElasticClientUntilSuccess();

    const reconnect = async () => {
        client = await getElasticClientUntilSuccess();
    };

    return {
        client,
        reconnect,
    };
};

export async function checkFileExists(file) {
    try {
        await fs.access(file);
        return true; // The file exists
    } catch {
        return false; // The file does not exist
    }
}

export async function logError(logger, e) {
    if (logger) {
        logger.error({
            error: e.name,
            message: e.message,
            stack: e.stack,
        });
        return;
    }
    console.error('❌', e);
}

export async function loopRetrying(
    callback,
    options = {
        logger: undefined,
        delayMs: LOOP_RETRYING_DELAY,
        afterErrorCallback: async () => {},
    }) {
    for (;;) {
        try {
            const result = await callback();
            if (result) break;
        } catch (e) {
            logError(options.logger, e);
            await delay(options.delayMs || LOOP_RETRYING_DELAY);
            await options?.afterErrorCallback?.();
        }
    }
}

function getRandomElement(arr) {
    if (arr && arr.length) {
        const index = Math.floor(Math.random() * arr.length);
        return arr[index];
    }
    return null;
}

export function chooseRandomOCRSpaceKey () {
    let keys = process.env.OCR_SPACE_API_KEYS;
    if (typeof keys === 'undefined') {
        throw 'specify OCR_SPACE_API_KEYS';
    }

    keys = keys.split(',');
    return getRandomElement(keys);
}
