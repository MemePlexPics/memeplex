import 'dotenv/config';
import { Client } from '@elastic/elasticsearch';
import mysql from 'mysql2/promise';
import process from 'process';
import { promises as fs } from 'fs';

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

export const getMysqlClient = async () => {
    // TODO: fix credentials
    const client = await mysql.createConnection({
        host: '127.0.0.1', //process.env.DB_HOST,
        port: '9507',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    });

    return client;
};

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
        catchDelayMs: 0,
        delayMs: 0,
        afterErrorCallback: async () => {},
    }) {
    for (;;) {
        try {
            const result = await callback();
            if (result) break;
        } catch (e) {
            logError(options.logger, e);
            if (options.catchDelayMs) await delay(options.catchDelayMs);
            await options?.afterErrorCallback?.();
        } finally {
            if (options.delayMs) await delay(options.delayMs);
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
        throw 'specify OCR_SPACE_API_KEYS, a comma-separated list of ocs.space keys';
    }

    keys = keys.split(',');
    return getRandomElement(keys);
}
