import 'dotenv/config';
import { Client } from '@elastic/elasticsearch';
import process from 'process';
import { promises as fs } from 'fs';

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

export async function checkFileExists(file) {
    try {
        await fs.access(file);
        return true; // The file exists
    } catch {
        return false; // The file does not exist
    }
}

export async function loopRetrying (callback, delayMs=5_000) {
    for (;;) {
        try {
            await callback();
        } catch (e) {
            console.error(e);
            await delay(delayMs);
        }
    }
};

function getRandomElement(arr) {
    if (arr && arr.length) {
        const index = Math.floor(Math.random() * arr.length);
        return arr[index];
    }
    return null;
}

export function chooseRandomOCRSpaceKey () {
    const keys = process.env.OCR_SPACE_API_KEYS;
    if (typeof keys === 'undefined') {
        throw "specify OCR_SPACE_API_KEYS";
    }

    keys = keys.split(',');
    return getRandomElement(keys);
}
